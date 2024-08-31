require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      //url: "http://127.0.0.1:8545/",
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337, // Asegúrate de que coincida con la configuración de tu red local
      accounts: [`${process.env.PRIVATE_KEY_localhost}`],
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [`${process.env.PRIVATE_KEY_fuji}`],
    },
  },
};