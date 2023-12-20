import mongoose from "mongoose";

//  id, name, email, last login time, registration time, status
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    selected: {
      type: Boolean,
    },
    lastTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
