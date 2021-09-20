const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("look a server");
});

module.exports = router;
