const express = require("express")
const router = express.Router()
const User = require('../models/user')

const getUser = async (req, res, next) => {
  let user;
  try {
    const { displayName } = req.params;
    user = await User.findOne({ displayName });
    if (user == null) return res.status(404);
  } catch (err) {
    return res.status(500)
  }
  res.user = user;
  next();
}

router.get('/', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.get('/:displayName', getUser, async (req, res) => {
  res.send(res.user)
})

router.post('/', async (req, res) => {
  const user = new User({
    displayName: req.body.displayName,
    email: req.body.email
  })
  try { 
    const newUser = await user.save()
    res.json(newUser)
  } catch (err){
    res.status(400).json({ message: err.message })
  }
})

module.exports = router