const { z } = require("zod");

const CreateRoomSchema = z.object({
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum no válida."),
    network: z.enum(['localhost', 'fuji']),
    betAmount: z.string().regex(/^\d+$/, "El monto de la apuesta debe ser un número positivo en formato string."),
    mapOwner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum no válida."),
});

const RegisterTowerDestructionSchema = z.object({
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum no válida."),
    network: z.enum(['localhost', 'fuji']),
    roomId: z.string().regex(/^\d+$/, "El ID de la sala debe ser un número positivo en formato string."),
    player: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum no válida."),
});

const DeclareWinnerSchema = z.object({
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum no válida."),
    network: z.enum(["localhost", "fuji"]),
    roomId: z.string().min(1, "El ID de la sala es requerido."),
    winner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum no válida."),
  });
  
// export all methods
module.exports = {
    CreateRoomSchema,
    RegisterTowerDestructionSchema,
    DeclareWinnerSchema
};