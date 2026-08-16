import User from "../models/User.js";
import AppError from "../utils/AppError.js";

export const registerService = async ({ name, email, password }) => {
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    throw new AppError("User already exist", 409);
  }
  const newUser = new User({
    name,
    email,
    password,
  });
  const user = await newUser.save();
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};