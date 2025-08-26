const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getMe = async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
};

const updateMe = async (req, res) => {
  const { username, bio } = req.body || {};
  const updates = {};
  if (typeof username === 'string') updates.username = username.trim();
  if (typeof bio === 'string') updates.bio = bio.trim();

  const user = await User.findByIdAndUpdate(req.user.userId, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.json(user);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ msg: 'Missing currentPassword or newPassword' });
  }

  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  const ok = await user.comparePassword(currentPassword);
  if (!ok)
    return res.status(401).json({ msg: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();

  res.json({ msg: 'Password updated successfully' });
};

const getAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      '+avatarBuffer +avatarMime'
    );
    if (!user || !user.avatarBuffer) {
      return res
        .status(404)
        .set('Cache-Control', 'public, max-age=600, immutable')
        .end();
    }

    let buf = user.avatarBuffer;
    if (!Buffer.isBuffer(buf)) {
      if (buf?.buffer) buf = Buffer.from(buf.buffer);
      else if (buf?.data && Buffer.isBuffer(buf.data)) buf = buf.data;
      else
        return res
          .status(404)
          .set('Cache-Control', 'public, max-age=600, immutable')
          .end();
    }

    res.setHeader('Content-Type', user.avatarMime || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600, immutable');
    return res.status(200).end(buf);
  } catch (e) {
    console.error('getAvatar error:', e);
    return res
      .status(404)
      .set('Cache-Control', 'public, max-age=300, immutable')
      .end();
  }
};

const uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  if (!/^image\//.test(req.file.mimetype)) {
    return res.status(400).json({ msg: 'Only image files are allowed' });
  }
  const user = await User.findById(req.user.userId).select(
    '+avatarBuffer +avatarMime'
  );
  if (!user) return res.status(404).json({ msg: 'User not found' });
  user.avatarBuffer = req.file.buffer;
  user.avatarMime = req.file.mimetype;
  user.hasAvatar = true;
  await user.save();
  return res.status(204).end();
};

const deleteAvatar = async (req, res) => {
  const user = await User.findById(req.user.userId).select(
    '+avatarBuffer +avatarMime'
  );
  if (!user) return res.status(404).json({ msg: 'User not found' });
  user.avatarBuffer = undefined;
  user.avatarMime = undefined;
  user.hasAvatar = false;
  await user.save();
  return res.status(204).end();
};

module.exports = {
  getMe,
  updateMe,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  getAvatar,
};
