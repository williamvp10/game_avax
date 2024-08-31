const prisma = require('./prismaClient');

const createUser = async (data) => {
  return await prisma.user.create({
    data,
  });
};

const getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

const getUserByWallet = async (wallet) => {
  return await prisma.user.findUnique({
    where: { wallet },
  });
};

const updateUser = async (userId, data) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
};

const deleteUser = async (userId) => {
  return await prisma.user.delete({
    where: { id: userId },
  });
};

module.exports = {
  createUser,
  getUserById,
  getUserByWallet,
  updateUser,
  deleteUser,
};
