const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const User = require("../models/user");
const router = new express.Router();

// USER LOGIN ROUTE (Public Route)
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send("Not able to login");
  }
});

// USER SIGN UP ROUTE (Public Route)
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    res.send({ user, token });

    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// USERS LISTING ROUTE USING NO AUTH MIDDLEWARE, OWN REFERENCE ROUTE
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(400).send("No Users Found");
  }
});

// ROUTE FOR UPDATING A PARTICULAR USER BY USING ID (AUTHENTICATED)
router.patch("/users/me", auth, async (req, res) => {
  // const _id = req.params.id;

  const updates = Object.keys(req.body);
  const allowedUpdates = ["email", "name", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// ROUTE FOR DELETING A USER BY USING ID (AUTHENTICATED)
router.delete("/users/me", auth, async (req, res) => {
  // const _id = req.params.id;

  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// LOGGING OUT FROM A PARTICULAR DEVICE ROUTE (AUTHENTICATED)
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// LOGGING OUT FROM ALL DEVICES ROUTE (AUTHENTICATED)
router.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// FETCHING USER PROFILE ROUTE (AUTHENTICATED)
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// UPLOADING USER AVATAR ROUTE (AUTHENTICATED)
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png)$/)) {
      return cb(new Error("Please upload a image file"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.send({ error: error.message });
  }
);

// DELETING THE USER AVATAR (AUTHENTICATED)
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

// Fetching an avatar
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user.avatar | !user) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
