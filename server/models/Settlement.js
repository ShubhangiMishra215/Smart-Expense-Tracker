import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      min: [0.01, "Amount must be greater than 0"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

settlementSchema.pre("validate", function () {
  if (this.to && this.from &&  this.from.equals(this.to)) {
    this.invalidate("to", "Cannot settle with yourself");
  }
});

settlementSchema.index({ group: 1, date: -1 });

const Settlement = mongoose.model("Settlement", settlementSchema);
export default Settlement;
