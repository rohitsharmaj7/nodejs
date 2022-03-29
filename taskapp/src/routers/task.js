const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

// route for adding the task (AUTHENTICATED)
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// route for listing the tasks (AUTHENTICATED)
router.get("/tasks", auth, async (req, res) => {
  try {
    await req.user.populate("tasks");
    res.send(req.user.tasks);
  } catch (e) {
    res.status(505).send(e);
  }
});

// route for fetching the task based upon the id (AUTHENTICATED)
router.get("/tasks/:id", auth, async (req, res) => {
  // console.log(req.params);
  // mongoose automatically convert those string IDs to the objectIDs, which native mongodb driver does not
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

// route for updating the task based upon id (AUTHENTICATED)
router.patch("/tasks/:id", auth, async (req, res) => {
  // console.log(req.params);
  // mongoose automatically convert those string IDs to the objectIDs, which native mongodb driver does not
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

// route for deleting user by id (AUTHENTICATED)
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
