const { SC_interact, SC_Capture_Emit, SC_Set_Method_Value } = require('../interact_contract');
const { CreateRoomSchema, RegisterTowerDestructionSchema, DeclareWinnerSchema } = require('@models/fortuneModels');

// Controlador para registrar un nuevo cuarto en el contrato SeaFortune
async function createRoom(req, res) {
    // Validar los datos con Zo
    let data = {};
    try {
        data = await CreateRoomSchema.parse(req.body);
    } catch (err) {
        return res.status(500).send({
            "error": err.message
        });
    }
    console.log("Data:", data);
    try {
        // Cargar la instancia del contrato SeaFortune
        const contractInstance = await SC_interact(data.contractAddress, data.network, 'SeaFortune');
        console.log("Contract instance:", contractInstance);
        // Convertir `betAmount` a un BigInt si es necesario (depende de cómo se pase el valor)
        const betAmountBigInt = BigInt(data.betAmount);

        // Ejecutar la función `registerRoom` y capturar el evento `RoomCreated`
        const eventArgs = await SC_Capture_Emit(contractInstance, 'registerRoom', 'RoomCreated', betAmountBigInt, data.mapOwner);
        console.log("Event args:", eventArgs);
        res.status(200).json({
            "roomId":eventArgs.split(",")[0],
            "betAmount":eventArgs.split(",")[1],
        });
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}



// Controlador para registrar la destrucción de una torre en el contrato SeaFortune
async function registerTowerDestruction(req, res) {
    try {
        // Validar los datos con Zod
        const data = await RegisterTowerDestructionSchema.parse(req.body);

        // Extraer los datos validados
        const { contractAddress, network, roomId, player } = data;

        // Cargar la instancia del contrato SeaFortune
        const contractInstance = await SC_interact(contractAddress, network, 'SeaFortune');

        // Convertir `roomId` a un BigInt
        const roomIdBigInt = BigInt(roomId);

        // Ejecutar la función `registerTowerDestruction`
        const result = await SC_Set_Method_Value(contractInstance, 'registerTowerDestruction', roomIdBigInt, player);
        console.log("Result:", result);
        if (result.success === true) {
            res.json({ success: true, message: "Tower destruction registered successfully." });
        } else {
            res.status(400).json({ success: false, error: result });
        }
    } catch (error) {
        // Manejo de errores de validación
        return res.status(500).send({
            success: false,
            error: err.message
        });
    }
}

// Controlador para registrar un nuevo cuarto en el contrato SeaFortune
async function declareWinner(req, res) {
    // Validar los datos con Zo
    let data = {};
    try {
        data = await DeclareWinnerSchema.parse(req.body);
    } catch (err) {
        return res.status(500).send({
            "error": err.message
        });
    }
    console.log("Data:", data);
    try {
        // Interactuar con el contrato en la red especificada
        const contractInstance = await SC_interact(data.contractAddress, data.network, "SeaFortune");

        // Ejecutar el método declareWinner usando SC_Set_Method_Value
        const eventArgs = await SC_Capture_Emit(contractInstance, "declareWinner", "WinnerDeclared", data.roomId, data.winner);
        console.log("Event args:", eventArgs);
        res.status(200).json({ success: true, message: `Winner declared successfully for room ${data.roomId}`, eventArgs });

    } catch (error) {
        console.error("Error declaring winner:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal server error",
        });
    }
}
module.exports = {
    createRoom,
    registerTowerDestruction,
    declareWinner
};



