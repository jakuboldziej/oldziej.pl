const express = require("express");
const authenticateUser = require("../middleware/auth");
const router = express.Router();

require('dotenv').config();

const wledDomain = process.env.WLED_DOMAIN;

const getWLEDstate = async (req, res) => {
  try {
    const response = await fetch(`${wledDomain}/json/state`);
    const responseData = await response.json();

    return responseData;

  } catch (err) {
    res.json({ message: err.message });
  }
}

router.get("/json-info", authenticateUser, async (req, res) => {
  try {
    const response = await fetch(`${wledDomain}/json/info`);
    const responseData = await response.json();

    res.json(responseData);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/json-state", authenticateUser, async (req, res) => {
  const WLEDstate = await getWLEDstate();

  res.json(WLEDstate);
});

router.get("/toggle", authenticateUser, async (req, res) => {
  try {
    let toggleState;

    const WLEDstate = await getWLEDstate();
    if (WLEDstate.on === true) toggleState = false;
    else toggleState = true;

    const response = await fetch(`${wledDomain}/json/state`, {
      method: "POST",
      body: JSON.stringify({
        on: toggleState
      }),
    });
    const responseData = await response.json();

    res.json(responseData);
  } catch (err) {
    res.json({ message: err.message });
  }
})

module.exports = router
