import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import Group from "../models/Group.js";
import GroupExpense from "../models/GroupExpense.js";
import { isMember } from "../utils/isMember.js";
import Settlement from "../models/Settlement.js";
import { rupeeToPaise, PaiseToRupee } from "../utils/rupeeConversion.js";

export const addGroup = async (name, creatorId, memberIds = []) => {
  const combined = [creatorId, ...memberIds];
  const set = new Set(combined.map((id) => id.toString()));
  const memberArray = [...set];

  const users = await User.find({ _id: { $in: memberArray } });
  if (users.length !== set.size) throw new AppError("Wrong IDs", 400);

  const newGroup = new Group({
    name: name,
    creator: creatorId,
    members: memberArray,
  });

  const group = await newGroup.save();
  return group;
};

export const addGroupExpense = async (userId, groupId, data) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  if (!isMember(userId, group.members)) {
    throw new AppError("You are not a member of this group", 403);
  }

  if (!isMember(data.payer, group.members)) {
    throw new AppError("Payer is not a member of this group", 400);
  }

  if (!Array.isArray(data.shares) || data.shares.length === 0) {
    throw new AppError("Shares are required", 400);
  }

  const shareIds = data.shares.map((share) => share.user.toString());
  if (new Set(shareIds).size !== shareIds.length) {
    throw new AppError("A user appears more than once in shares", 400);
  }

  for (const share of data.shares) {
    if (!isMember(share.user, group.members)) {
      throw new AppError("Everyone in shares must be a group member", 400);
    }
  }

  const expense = new GroupExpense({
    group: groupId,
    payer: data.payer,
    description: data.description,
    category: data.category,
    amount: data.amount,
    shares: data.shares,
    date: data.date,
  });

  return await expense.save();
};

const computeBalances = async (group) => {
  // net balance per member in paise: positive = is owed, negative = owes
  const balances = new Map(group.members.map((m) => [String(m), 0]));

  const expenses = await GroupExpense.find({ group: group._id });
  for (const expense of expenses) {
    const payer = String(expense.payer);
    for (const share of expense.shares) {
      const user = String(share.user);
      if (user === payer) continue; // payer's own share is skipped
      const paise = rupeeToPaise(share.amount);
      balances.set(user, balances.get(user) - paise);
      balances.set(payer, balances.get(payer) + paise);
    }
  }

  const settlements = await Settlement.find({ group: group._id });
  for (const s of settlements) {
    const paise = rupeeToPaise(s.amount);
    balances.set(String(s.from), balances.get(String(s.from)) + paise);
    balances.set(String(s.to), balances.get(String(s.to)) - paise);
  }

  const total = [...balances.values()].reduce((sum, b) => sum + b, 0);
  if (total !== 0) throw new AppError("Balances do not sum to zero", 500);

  return balances;
};

export const getGroupBalances = async (groupId, requesterId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  if (!isMember(requesterId, group.members)) {
    throw new AppError("You are not a member of this group", 403);
  }

  const balances = await computeBalances(group);

  return [...balances.entries()].map(([user, paise]) => ({
    user,
    balance: PaiseToRupee(paise),
  }));
};

export const addSettlement = async (userId, groupId, data) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  if (!isMember(userId, group.members)) {
    throw new AppError("You are not a member of this group", 403);
  }

  const { from, to, amount } = data;

  if (!isMember(from, group.members)) {
    throw new AppError("Sender is not a member of this group", 400);
  }

  if (!isMember(to, group.members)) {
    throw new AppError("Receiver is not a member of this group", 400);
  }

  if (String(from) === String(to)) {
    throw new AppError("Sender and receiver cannot be the same", 400);
  }

  if (typeof amount !== "number" || !(amount > 0)) {
    throw new AppError("Amount must be a positive number", 400);
  }

  const total = rupeeToPaise(amount);

  const balances = await computeBalances(group);
  const fromBalance = balances.get(String(from));
  const toBalance = balances.get(String(to));

  if (fromBalance >= 0) {
    throw new AppError("Sender does not owe anything", 400);
  }
  if (toBalance <= 0) {
    throw new AppError("Receiver is not owed anything", 400);
  }

  const cap = Math.min(-fromBalance, toBalance);
  if (total > cap) {
    throw new AppError(
      `Settlement exceeds the allowed amount of ₹${PaiseToRupee(cap)}`,
      400,
    );
  }

  const newSettlement = new Settlement({
    group: group._id,
    from,
    to,
    amount,
    date: Date.now(),
  });

  return await newSettlement.save();
};

export const getSettlementSuggestions = async (groupId, requesterId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new AppError("Group not found", 404);

  if (!isMember(requesterId, group.members)) {
    throw new AppError("You are not a member of this group", 403);
  }

  const balance = await computeBalances(group);
  let debtor = [];
  let creditor = [];
  balance.forEach((amount, user) => {
    if (amount > 0) creditor.push({ user, amount });
    if (amount < 0) debtor.push({ user, amount: -amount });
  });

  creditor.sort((a, b) => b.amount - a.amount);
  debtor.sort((a, b) => b.amount - a.amount);

  let result = [];

  while (creditor.length > 0 && debtor.length > 0) {
    let payment = Math.min(creditor[0].amount, debtor[0].amount);

    result.push({
      from: debtor[0].user,
      to: creditor[0].user,
      amount: PaiseToRupee(payment),
    });
    creditor[0].amount -= payment;
    debtor[0].amount -= payment;

    if (creditor[0].amount === 0) creditor.shift();
    if (debtor[0].amount == 0) debtor.shift();

    creditor.sort((a, b) => b.amount - a.amount);
    debtor.sort((a, b) => b.amount - a.amount);
  }
  return result;
};
