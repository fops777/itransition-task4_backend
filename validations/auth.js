import { body } from "express-validator";

export const registerValidation = [
  body("email", "Invalid email format").isEmail(),
  body("password", "Invalid password format"),
  body("name", "Enter your name"),
  body("status"),
  body("selected"),
  body("lastTime"),
];
