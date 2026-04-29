import { Router } from "express";
import { getUsers } from "#controllers/user.controller.js";
import { postUsers } from "#controllers/user.controller.js";

const router = Router();

router.get("/", getUsers);
router.post("/", postUsers);

export default router;
