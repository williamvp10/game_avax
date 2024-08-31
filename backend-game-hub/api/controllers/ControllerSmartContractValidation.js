//const ethers = require('ethers');
const hre = require("hardhat");
const path = require('path');

async function getSigners(numUsers) {
    const signers = await hre.ethers.getSigners();
    return signers.slice(0, numUsers); // Retorna los primeros 'numUsers' signers
}

async function formatError(errorMessage) {
     // Eliminar códigos de colores y otros caracteres especiales
     let cleanedMessage = errorMessage.replace(/\x1B\[\d+m/g, '');

     // Extraer información relevante usando expresiones regulares
     const regex = /(ParserError:.+)\n\s+-->\s(.*\.sol):(\d+:\d+):\n\s+\|\n(\d+\s+\|.*\n\s+\|.*\^)/gm;
     const matches = regex.exec(cleanedMessage);
     const regexFilePath= /\/contracts\/.*/;
     
     if (matches) {
         // Construir el mensaje formateado
         const errorType = matches[1].trim();
         const fileLocation = matches[2].trim();
         
         const errorPosition = matches[3].trim();
         const errorContext = matches[4].trim();
 
         let formattedMessage = `- Error Type: ${errorType}\n`;
         formattedMessage += `- File: ${regexFilePath.exec(fileLocation)}\n`;
         formattedMessage += `- Position: ${errorPosition}\n`;
         formattedMessage += `- Context:\n${errorContext}`;
         return formattedMessage;
     } else {
         // Si no se encuentran coincidencias, retornar el mensaje original limpio
         return cleanedMessage;
     }
}

async function SC_deploy(contractsDir, contractName, constructorArgs) {

    // Compilamos el proyecto de Hardhat, lo que compilará todos los contratos del proyecto
    //hre.config.updateContractPath(contractsDir);
    // Guarda las funciones originales de la consola
    const originalConsoleError = console.error;

    // Captura la salida de la consola
    let consoleOutput = [];
    const captureOutput = (message) => consoleOutput.push(message);
    console.error = captureOutput;
    try{
        await hre.run('compile');
    }catch(error){
        let errorDetails = "";
        consoleOutput.forEach((line) => {
                errorDetails+=line;
        });
        error.message += ":\n" + await formatError(errorDetails);
        throw error;
    } finally {
        // Restaura las funciones originales de la consola
        console.error = originalConsoleError;
    }
    
    const qualifiedContractName = `${contractsDir}/${contractName}.sol:${contractName}`;
    // Obtiene la fábrica del contrato usando el nombre completamente calificado
    console.log("Obteniendo fábrica para:", qualifiedContractName);
    const SmartContractFactory = await hre.ethers.getContractFactory(qualifiedContractName);
    
    // Extrae los argumentos del objeto JSON
    const args = Object.values(constructorArgs);
    // Pasa los argumentos extraídos al método deploy
    const contractInstance = await SmartContractFactory.deploy(...args);
    return contractInstance; // Retorna la instancia del contrato desplegado
}

async function SC_Set_Method_Value(contractInstance, methodName, ...methodArgs) {
    // Asegúrate de que el contrato tiene el método solicitado
    if (typeof contractInstance[methodName] !== 'function') {
        throw new Error(`Method ${methodName} not found in the smart contract`);
    }

    // Ejecuta el método dinámicamente
    //const setValueTx = await contractInstance[methodName](value);
    //await setValueTx.wait(); // Espera a que la transacción sea minada
    // Ejecuta el método dinámicamente
    try{
        let setValueTx = null;
        if (methodArgs.length === 0 || methodArgs == null || methodArgs == undefined) {
            setValueTx = await contractInstance[methodName]();
        }else{
            setValueTx = await contractInstance[methodName](...methodArgs);
        }
        //console.log("setValueTx: ", setValueTx);
        return true;
    }catch(error){
        // Intenta extraer el mensaje de error específico usando una expresión regular
        const reasonMatch = error.message.match(/reverted with reason string '(.*)'/);
        if (reasonMatch && reasonMatch[1]) {
            // Si se encuentra el mensaje, devuélvelo
            const reason = reasonMatch[1];
            //console.log("Revert reason:", reason);
            return reason; // Retorna solo el mensaje de error específico
        } else {
            return error.message; // Retorna el mensaje de error completo
        }
    }
}

async function SC_get_Method_Value(contractInstance, methodName, ...methodArgs) {
    // Asegúrate de que el contrato tiene el método solicitado
    if (typeof contractInstance[methodName] !== 'function') {
        throw new Error(`Método no encontrado '${methodName}' en el smart contract, Asegúrate de que el nombre '${methodName}' del método esté correctamente escrito y que esté definido en el contrato.`);
    }
    // Ejecuta el método dinámicamente
    try{
        let value;
        if (methodArgs.length === 0 || methodArgs == null || methodArgs == undefined) {
            value = await contractInstance[methodName]();
        }else{
            value = await contractInstance[methodName](...methodArgs);
        }
        return value.toString(); // Convierte el resultado a string para manejar grandes números
    }catch(error){
        // Intenta extraer el mensaje de error específico usando una expresión regular
        const reasonMatch = error.message.match(/reverted with reason string '(.*)'/);
        if (reasonMatch && reasonMatch[1]) {
            // Si se encuentra el mensaje, devuélvelo
            const reason = reasonMatch[1];
            //console.log("Revert reason:", reason);
            return reason; // Retorna solo el mensaje de error específico
        } else {
            return error.message; // Retorna el mensaje de error completo
        }
    }
}


async function SC_Capture_Emit(contractInstance, methodName, eventName, ...methodArgs) {
    
    try{
        // Asegúrate de que el contrato tiene el método solicitado
        if (typeof contractInstance[methodName] !== 'function') {
            throw new Error(`Error: Método no encontrado '${methodName}' en el smart contract, Asegúrate de que el nombre '${methodName}' del método esté correctamente escrito y que esté definido en el contrato.`);
        }

        // Asegúrate de que el contrato tiene el evento solicitado
        if (typeof contractInstance.filters[eventName] !== 'function') {
            throw new Error(`Error: Evento '${eventName}' no encontrado en el smart contract, Asegúrate de que el nombre '${eventName}' del evento esté correctamente escrito y que esté definido en el contrato.`);
        }

        // Prepara para capturar el evento usando el nombre del evento proporcionado
        const filter = contractInstance.filters[eventName](); // Usa 'eventName' para crear el filtro

        const promise = new Promise((resolve, reject) => {
            contractInstance.once(filter, (event) => {
                resolve(event); // Resuelve la promesa con los datos del evento
            }).catch((error) => {
                reject(error);
            });
            //en caso de que no se emita el evento en un tiempo determinado

            // Opcional: agregar un temporizador para rechazar la promesa si el evento no se emite en un tiempo determinado
            /*setTimeout(() => {
                reject(new Error("Event timeout"));
            }, 5000); // Ajusta el tiempo de espera según sea necesario*/
        });

    
        let setValueTx = null;
        if (methodArgs.length === 0 || methodArgs == null || methodArgs == undefined) {
            setValueTx = await contractInstance[methodName]();
        }else{
            setValueTx = await contractInstance[methodName](...methodArgs);
        }
        
        const event = await promise;

        // Procesa y devuelve los datos del evento según sea necesario
        //retorna los argumentos del evento en string
        return event.args.join();
        //return event.args; // Retorna los argumentos del evento
    }catch(error){
        // Intenta extraer el mensaje de error específico usando una expresión regular
        const reasonMatch = error.message.match(/reverted with reason string '(.*)'/);
        if (reasonMatch && reasonMatch[1]) {
            // Si se encuentra el mensaje, devuélvelo
            const reason = reasonMatch[1];
            //console.log("Revert reason:", reason);
            return reason; // Retorna solo el mensaje de error específico
        } else {
            return error.message; // Retorna el mensaje de error completo
        }
    }
    
}


async function SC_testErrorHandling(contractInstance, methodName, methodArgs) {
    try {
        // Asegúrate de que el contrato tiene el método solicitado
        if (typeof contractInstance[methodName] !== 'function') {
            throw new Error(`Method ${methodName} not found in the contract`);
        }

        // Ejecuta el método dinámicamente con los argumentos proporcionados
        await contractInstance[methodName](...methodArgs);

        // Si la ejecución es exitosa sin lanzar un error, se considera fallida la prueba de manejo de errores
    } catch (error) {
        // Aquí puedes personalizar la lógica de validación del error según tus necesidades
        if (error.message.includes("revert")) { // Comprueba si el mensaje de error incluye 'revert', lo que indica un fallo controlado
            console.log("Comportamiento en caso de error: PASSED");
        } else {
            console.log("Comportamiento en caso de error: FAILED", error.message);
        }
    }
}



async function SC_Set_Method_Value_From_User(contractInstance, methodName, user, value) {
    //const [owner, user1, user2] = await hre.ethers.getSigners();

    if (typeof contractInstance[methodName] !== 'function') {
        throw new Error(`Method ${methodName} not found in the smart contract`);
    }

    const setValueTx = await contractInstance.connect(user)[methodName](value);
    await setValueTx.wait();
}


async function executeSmartContractMethod(caso, contractInstance) {
    let resultado = null;
        /*
        caso =  {
                            "salidaEsperada": "[{\"id\": 20,\"brand\": \"Renault\",\"model\": 2019,\"category_id\": 1}]",
                            "orden": 1,
                            "visible": true,
                            "metodo": "POST",
                            "url": "ords/admin/prueba/car/20",
                            "parametros": [
                                {
                                    "nombre": "",
                                    "typeParametro": "json",
                                    "tyParametroEntrada": "ords/admin/prueba/car",
                                    "valorEntrada": "{\"id\": 20, \"brand\": \"Renault\", \"model\": 2019, \"category_id\": 1}"
                                }
                            ]
                        }
        */
        
    let methodName = caso["url"];
    const parametros = caso["parametros"];
    const testType = caso["metodo"];
    // Prepara los argumentos extrayendo el valor de cada uno
    const args = parametros.map(arg => {
        // Aquí puedes agregar más lógica de conversión dependiendo del tipo de parámetro (typeParametro)
        return arg.typeParametro === 'int' ? parseInt(arg.valorEntrada) : arg.valorEntrada;
    });
    //console.log("args: ", args);
    switch (testType) {
        case "GET":
            resultado = await SC_get_Method_Value(contractInstance,
                            methodName, 
                            ...args);
            break;
        case "POST":
            resultado = await SC_Set_Method_Value(contractInstance, 
                            methodName, 
                            ...args);
            break;
        case "POST_EVENT":
            //pasar string a json
            const dataEvent = await JSON.parse(caso["url"]);
            const eventName = dataEvent["nombre_evento"];
            methodName = dataEvent["nombre_metodo"];

            resultado = await SC_Capture_Emit(contractInstance, 
                            methodName, 
                            eventName,
                            ...args);
            break;
        default:
            resultado = {"error": `Error expresión '${testType}' no valida `};
            break;
    }
    return resultado;
}


//exportamos las funciones definidas
module.exports = {
    SC_deploy,
    SC_Set_Method_Value,
    SC_get_Method_Value,
    SC_Capture_Emit,
    SC_testErrorHandling,
    SC_Set_Method_Value_From_User,
    executeSmartContractMethod
};
