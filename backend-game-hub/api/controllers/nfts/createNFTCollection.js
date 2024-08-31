const hre = require("hardhat");
const path = require('path');
const fs = require('fs');
const { ethers } = require("ethers");

// Cargamos el modelo de datos
const { CreateCollectionNFTSchema } = require('../../models/retoModels');

// Cargamos el controlador de despliegue
const { SC_deploy } = require('../deploy');

async function createNFTCollection(req, res) {
    let data = {};
    try {
        data = await CreateCollectionNFTSchema.parse(req.body);
    } catch (err) {
        return res.status(500).send({
            "error": err.message
        });
    }

    try {
        const constructorArgs = {
            name: data.name,
            symbol: data.symbol,
            initialOwner: data.initialOwner,
            initialURI: data.initialURI
        };

        const contractsDir = path.join(__dirname, "..", "..", "..", "artifacts", "contracts", "templates");
        const contractName = "NFTCollection"; // Nombre del contrato sin la extensión .sol

        let result = [];
        for (let network of data.networks) {
            console.log("Deploying to network:", network);
            const { contractInstance, abi } = await SC_deploy(contractsDir, contractName, constructorArgs, network);
            const nftCollection = await contractInstance.waitForDeployment();

            const contractAddress = await nftCollection.getAddress();
            console.log("Contract deployed at:", contractAddress);
            
            // Crear la colección en el contrato
            //const createCollectionTx = await contractInstance.createCollection(data.name, data.maxSupply);
            //await createCollectionTx.wait(); // Esperar a que se mine la transacción
            result.push({ "network": network, "address": contractAddress, "abi": abi });
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createNFTCollection
};
