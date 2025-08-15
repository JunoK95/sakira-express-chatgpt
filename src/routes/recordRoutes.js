import express from "express";
import recordDemo from "../services/recordDemo.cjs";

const router = express.Router();

router.post("/", async (req, res) => {
  res.send(recordDemo());
});

export default router;
