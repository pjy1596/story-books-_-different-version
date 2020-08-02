const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const Story = require("../models/Story");
router.get("/", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "login",
  });
});
// 이미 등록된 id랑 지금 글쓰는 사람의 id가 일치해야 save 됨
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render("dashboard", {
      name: req.user.fullName,
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});
module.exports = router;
