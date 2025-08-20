import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  res.send("Full Chat Route");
});

module.exports = router;
