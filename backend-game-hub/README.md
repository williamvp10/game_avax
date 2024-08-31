# Game Hub Backend

This project is a backend application designed to create interchain tokens using Axelar and generate NFTs. It provides functionality for token creation, management, and interchain communication. The application utilizes the Axelar network to facilitate seamless token transfers across different blockchain networks. Additionally, it includes features for NFT creation and management, allowing users to mint, transfer, and interact with non-fungible tokens. The project leverages the power of blockchain technology to enable secure and decentralized tokenization and NFT functionality. 


## Instalación

```bash
npm install
```

## Uso local

```bash
node index.js
```

## Uso con Docker

```bash
docker build -t game_hub_api .
docker run -p 3800:3800 game_hub_api
docker run -it -p 3800:3800 game_hub_api
```


# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test

# start node
npx hardhat node

#deloy
npx hardhat ignition deploy ./ignition/modules/Lock.js
```


