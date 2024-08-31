const hre = require("hardhat");
const { ethers } = require("ethers");
const path = require('path');
const fs = require('fs');

// Cargamos el controlador de despliegue
const { SC_deploy } = require('./deploy');
const { CreateTokenSchema } = require('../models/retoModels');

async function createCrossChainToken(req, res) {
    let data = {};
    try {
        data = await CreateTokenSchema.parse(req.body);
    } catch (err) {
        return res.status(500).send({
            "error": err.message
        });
    }

    try {
        // Definir argumentos para el contrato cross-chain
        const constructorArgs = {
            name: data.name,
            symbol: data.symbol,
            initialSupply: hre.ethers.parseUnits(`${data.initialSupply}`, 18),
            gatewayAddress: process.env.AXELAR_GATEWAY_ADDRESS
        };

        // Llama a la función SC_deploy para compilar y desplegar el contrato
        console.log("networks", data.networks);

        // path del contrato template compilado
        const contractsDir = path.join(__dirname, "..", "..", "artifacts", "contracts", "templates");
        const contractName = "CrossChainToken"; // Nombre del contrato sin la extensión .sol

        // Desplegar el contrato en cada red
        let result = [];
        for (let network of data.networks) { 
            console.log("Deploying to network:", network);
            const { contractInstance, abi } = await SC_deploy(contractsDir, contractName, constructorArgs, network);
            const token = await contractInstance.waitForDeployment();

            const contractAddress = await token.getAddress();
            console.log("Contract deployed at:", contractAddress);
            result.push({ "network": network, "address": contractAddress, "abi": abi });
        }
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCrossChainToken
};
