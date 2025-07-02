const User = require('../models/User');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    const user = await User.create({ email, password, username: email }); 
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
      }
    );

    res.status(201).json({ user: { email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
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

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ msg: 'If user exists, email was sent' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: '10m' }
    );

    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Click this link to reset your password: <a href="${link}">${link}</a></p>`,
    });

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    res.status(200).json({ msg: 'Reset link sent' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ msg: 'Missing token or password' });
  }

  try {
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ msg: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ msg: 'Invalid or expired token' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
