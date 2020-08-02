const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});
router.post("/", ensureAuth, async (req, res) => {
  try {
    // const story = new Story({
    //   title: req.body.title,
    //   body: req.body.body,
    //   status: req.body.status,
    //   user: req.user.id,
    // });
    // story.save();
    // 위처럼 해도 됨
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();
    // login된 유저와 story 유저가 같은지 물어보는 과정을 까먹음
    if (!story) {
      return res.render("error/404");
    }
    if (story.user == req.user.id) {
      res.render("stories/edit", {
        story,
      });
    } else {
      res.redirect("/stories");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();
    if (!story) {
      return res.render("error/404");
    }
    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});
// router.delete("/:id", ensureAuth, async (req, res) => {
//   try {
//     await Story.remove({ _id: req.params.id });
//     res.redirect("/dashboard");
//   } catch (err) {
//     console.error(err);
//     return res.render("error/500");
//   }
// });
// 더 secure하게. 스토리 유저랑 로그인 된 애랑 같은지 확인
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();
    if (!story) {
      return res.render("error/404");
    }
    if (story.user != req.user.id) {
      res.redirect("/dashboard");
    } else {
      await Story.remove({ _id: req.params.id });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate("user").lean();
    if (!story) {
      return res.render("error/404");
    } else {
      res.render("stories/show", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    let stories = await Story.find({
      user: req.params.userId,
      status: "public",
    })
      .populate("user")
      .lean();
    if (!stories) {
      return res.render("error/404");
    }
    return res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(Err);
    res.render("error/500");
  }
});
module.exports = router;
