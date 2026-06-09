import { usermodel } from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { tokenBlacklistModel } from "../models/blacklist.js";

// register

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
}

async function registerUserController(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ messege: "User not found" });
  }

  let isAllReadyExist = await usermodel.findOne({
    $or: [{ username }, { email }],
  });
  if (isAllReadyExist) {
    return res
      .status(400)
      .json({ messege: "User exist with this eemail or username" });
  }

  const hashy = await bcrypt.hash(password, 10);
  const user = await new usermodel({
    username,
    email,
    password: hashy,
  });
  await user.save();

  //creating token
  const token = createToken(user);

  res.cookie("token", token);
  res.status(201).json({
    message: "Signed up successfully",
    user: {
      id: user._id,
      email: user.email,
    },
  });
}

//login
async function loginUserController(req, res) {
  const { email, password } = req.body;
  const user = await usermodel.findOne({ email });
  if (!user) {
    return res.status(400).json({ messge: "Invalid email or password" });
  }
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(400).json({ message: "Invalid email id or password" });
  }

  const token = createToken(user);
  res.cookie("token", token);
  res.status(201).json({
    messege: "Logged in successfully",

    user: {
      id: user._id,
      email: user.email,
    },
  });
}

//Logout
async function logoutUserCOntroller(req, res) {
  const token = req.cookies.token;
  const black = await new tokenBlacklistModel({ token });
  res.clearCookie("token");
  await black.save();
  return res.status(200).json({ message: "User logged out successfullly" });
}

// current user want to logout
async function getmeController(req, res) {
  const user = await usermodel.findById(req.user.id);
  res.status(201).json({
    message: "logged out successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}
export const authcontroller = {
  registerUserController,
  loginUserController,
  logoutUserCOntroller,
  getmeController,
};
