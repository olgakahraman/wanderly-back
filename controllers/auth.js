const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const user = await User.create(req.body);
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
  res.status(201).json({ user: { email: user.email }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ msg: 'Invalid Credentials' });
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return res.status(401).json({ msg: 'Invalid Credentials' });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.status(200).json({ user: { email: user.email }, token });
};

module.exports = { register, login };
