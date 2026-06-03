import express from "express";
import { authcontroller } from "../controller/authconntroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();
// register
router.post("/register", authcontroller.registerUserController);
//login
router.post("/login", authcontroller.loginUserController);
//logout
router.get("/logout", authcontroller.logoutUserCOntroller);
// finding which user have created logout request
router.get("/get-me", authMiddleware.authUser, authcontroller.getmeController);

export const authrouter = router;
