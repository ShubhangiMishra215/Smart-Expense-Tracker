import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import Group from "../models/Group.js";
import GroupExpense from "../models/GroupExpense.js";
import { isMember } from "../utils/isMember.js";

export const addGroup = async (name, creatorId, memberIds=[]) => {
  const combined = [creatorId,...memberIds];
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
        date: data.date
    });

    return await expense.save();
};