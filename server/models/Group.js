import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

groupSchema.index({ creator: 1, name: 1 }, { unique: true });
groupSchema.index({ members: 1 });

const Group = mongoose.model("Group", groupSchema);
export default Group;