const userDao = require('@dao/userDao');

const createUser = async (req, res) => {
  const { wallet, username } = req.body;

  try {
    const user = await userDao.createUser({ wallet, username });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await userDao.getUserById(parseInt(userId));
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user' });
  }
};

const getUserByWallet = async (req, res) => {
  const { wallet } = req.params;

  try {
    const user = await userDao.getUserByWallet(wallet);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user' });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username } = req.body;

  try {
    const user = await userDao.updateUser(parseInt(userId), { username });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await userDao.deleteUser(parseInt(userId));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByWallet,
  updateUser,
  deleteUser,
};
