const hre = require("hardhat");
const { ethers } = require("ethers");
const path = require('path');
const fs = require('fs');

async function SC_interact(contractAddress, network, contractName) {
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
    // Compilar el contrato
    try {
        await hre.run('compile');
    } catch (error) {
        //emitir error
        console.error(error);
        throw new Error("Error compiling contract", error);
    }
    try {
        const artifactPath = path.join(__dirname,"../","../", "artifacts/contracts/seaoffortune", `${contractName}.sol`, `${contractName}.json`);
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        const contractInstance = new ethers.Contract(contractAddress, artifact.abi, wallet);

        return contractInstance; // Retorna la instancia del contrato
    } catch (error) {
        console.error("Error loading contract:", error);
        throw new Error(error.message);
    }
}

async function SC_Set_Method_Value(contractInstance, methodName, ...methodArgs) {
    if (typeof contractInstance[methodName] !== 'function') {
        throw new Error(`Method ${methodName} not found in the smart contract`);
    }

    try {
        let setValueTx;
        if (methodArgs.length === 0) {
            setValueTx = await contractInstance[methodName]();
        } else {
            setValueTx = await contractInstance[methodName](...methodArgs);
        }
        await setValueTx.wait();
        return { success: true };
    } catch (error) {
        const reasonMatch = error.message.match(/reverted with reason string '(.*)'/);
        if (reasonMatch && reasonMatch[1]) {
            return { success: false, error: reasonMatch[1] };
        } else {
            return { success: false, error: error.message };
        }
    }
}

async function SC_get_Method_Value(contractInstance, methodName, ...methodArgs) {
    if (typeof contractInstance[methodName] !== 'function') {
        throw new Error(`Method '${methodName}' not found in the smart contract`);
    }
    try {
        let value;
        if (methodArgs.length === 0) {
            value = await contractInstance[methodName]();
        } else {
            value = await contractInstance[methodName](...methodArgs);
        }
        return value.toString();
    } catch (error) {
        const reasonMatch = error.message.match(/reverted with reason string '(.*)'/);
        if (reasonMatch && reasonMatch[1]) {
            return reasonMatch[1];
        } else {
            return error.message;
        }
    }
}

async function SC_Capture_Emit(contractInstance, methodName, eventName, ...methodArgs) {
    try {
        if (typeof contractInstance[methodName] !== 'function') {
            throw new Error(`Error: Method '${methodName}' not found in the smart contract`);
        }
        if (typeof contractInstance.filters[eventName] !== 'function') {
            throw new Error(`Error: Event '${eventName}' not found in the smart contract`);
        }

        const filter = contractInstance.filters[eventName]();
        const promise = new Promise((resolve, reject) => {
            contractInstance.once(filter, (event) => {
                resolve(event);
            }).catch((error) => {
                reject(error);
            });
        });

        let setValueTx;
        if (methodArgs.length === 0) {
            setValueTx = await contractInstance[methodName]();
        } else {
            setValueTx = await contractInstance[methodName](...methodArgs);
        }

        const event = await promise;
        return event.args.join();
    } catch (error) {
        const reasonMatch = error.message.match(/reverted with reason string '(.*)'/);
        if (reasonMatch && reasonMatch[1]) {
            return reasonMatch[1];
        } else {
            return error.message;
        }
    }
}

module.exports = {
    SC_interact,
    SC_get_Method_Value,
    SC_Capture_Emit,
    SC_Set_Method_Value
};
