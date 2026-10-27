import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import Group from "../models/Group.js";

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
