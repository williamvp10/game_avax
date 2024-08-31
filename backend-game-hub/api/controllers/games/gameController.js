const gameDao = require('@dao/gameDao');

const createGame = async (req, res) => {
  const { name, description, userId } = req.body;

  try {
    const game = await gameDao.createGame({ name, description, userId });
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Error creating game' });
  }
};

const getGamesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const games = await gameDao.getGamesByUser(parseInt(userId));
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving games' });
  }
};

const updateGame = async (req, res) => {
  const { gameId } = req.params;
  const { name, description } = req.body;

  try {
    const game = await gameDao.updateGame(parseInt(gameId), { name, description });
    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Error updating game' });
  }
};

const deleteGame = async (req, res) => {
  const { gameId } = req.params;

  try {
    await gameDao.deleteGame(parseInt(gameId));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting game' });
  }
};

module.exports = {
  createGame,
  getGamesByUser,
  updateGame,
  deleteGame,
};
