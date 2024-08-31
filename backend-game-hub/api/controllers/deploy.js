const hre = require("hardhat");
const { ethers } = require("ethers");
const path = require('path');
const fs = require('fs');



async function SC_deploy(contractsDir, contractName, constructorArgs, network) {
    // Configurar el proveedor según la red seleccionada
    let provider;
    let wallet;

    if (network === "localhost") {
        provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        wallet = new ethers.Wallet(process.env.PRIVATE_KEY_localhost, provider);
    } else if (network === "fuji") {
        provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
        wallet = new ethers.Wallet(process.env.PRIVATE_KEY_fuji, provider);
    } else {
        throw new Error("Unsupported network");
    }
    console.log(`Using network: ${network}`);
    console.log("deployed wallet", wallet.address);
    console.log(`RPC URL: ${provider.getNetwork().rpcUrl}`);

    // Compilar el contrato
    try {
        await hre.run('compile');
    } catch (error) {
        //emitir error
        console.error(error);
        throw new Error("Error compiling contract", error);
    }
    
    //const qualifiedContractName = `${contractsDir}/${contractName}.sol`;
    const artifactPath = path.join(contractsDir, `${contractName}.sol`, `${contractName}.json`);
    console.log("artifactPath", artifactPath);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;
    const bytecode = artifact.bytecode;

    // Desplegar el contrato usando ethers.js
    const ContractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    const args = Object.values(constructorArgs);
    console.log("args", args);
    const contractInstance = await ContractFactory.deploy(...args);
    console.log("deployed", contractInstance);
    return { contractInstance, abi}; // Retorna la instancia del contrato, el ABI, y la URL de RPC
}



module.exports = {
    SC_deploy
  };