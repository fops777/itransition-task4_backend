import express from "express";
// import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { registerValidation } from "./validations/auth.js";
import { validationResult } from "express-validator";
import cors from "cors";
import UserModel from "./models/UserModel.js";
// import checkAuth from "./utils/checkAuth.js";
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGODB_URI;
// console.log(URI);

mongoose
  .connect(URI)
  .then(() => console.log("DB - OK"))
  .catch((err) => console.log(err));

const app = express();
app.use(cors()); // Разрешает бэкенду получать запросы откуда угодно
app.use(express.json());

app.post("/login", async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const user = await UserModel.findOne({ email: req.body.email });

    // Обновление lastTime(время последней логинизации)
    await UserModel.updateOne(user, {
      $set: { lastTime: `${new Date().toLocaleString()}` },
    });

    // Если не нашли пользователя
    if (!user) {
      return res.status(404).json({
        message: "Invalid password or email address", // На самом деле не найден пользователь
      });
    }

    // Сходятся ли пароли
    // console.log(req.body.password);
    // console.log(user._doc.password);

    const isValidPass = req.body.password === user._doc.password;

    if (!isValidPass) {
      return res.status(400).json({
        message: "Invalid password or email address",
      });
    }

    res.json({
      ...user._doc,
      // token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось зарегаться",
    });
  }
});

app.post("/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const doc = new UserModel({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      status: req.body.status,
      selected: req.body.selected,
      lastTime: req.body.lastTime,
    });

    const user = await doc.save();

    res.json({
      ...user._doc,
      // token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to register user",
    });
  }
});

// app.get("/me", checkAuth, async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.userId);

//     if (!user) {
//       return res.status(404).json({
//         message: "Пользователь не найден",
//       });
//     }

//     // const { ...userData } = user._doc;
//     // res.json(userData);

//     // res.json(user._doc);
//     res.json(user);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Не удалось зарегать юзера",
//     });
//   }
// });

app.get("/users", async (req, res) => {
  // res.json("heey");
  try {
    const users = await UserModel.find(); // Используем метод find для получения всех пользователей из базы данных
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось получить юзеров",
    });
  }
});

app.delete("/users", async (req, res) => {
  const { ids } = req.body;

  try {
    const result = await UserModel.deleteMany({ _id: { $in: ids } }); // Удаляем пользователей с указанными идентификаторами
    res.json({ message: `${result.deletedCount} пользователей удалено` });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось получить юзеров",
    });
  }
});

app.patch("/block", async (req, res) => {
  let { ids } = req.body.data;
  try {
    const result = await UserModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: `blocked` } }
    );

    res.json(`Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось получить юзеров",
    });
  }
});

app.patch("/unlock", async (req, res) => {
  let { ids } = req.body.data;
  try {
    const result = await UserModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: `active` } }
    );

    res.json(`Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось получить юзеров",
    });
  }
});

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server OK");
});
