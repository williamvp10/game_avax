const { z } = require('zod');

// schema token creation
const CreateTokenSchema = z.object({
    name: z.string().min(1, "El nombre es requerido."),
    symbol: z.string().min(1, "El símbolo es requerido."),
    decimals: z.number(),
    initialSupply: z.number(),
    tokenOwner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum no válida."),
    // lista de netwoks soportados (localhost, fuji, sepolia, ethereum, etc)
    networks: z.array(z.string()),
}).refine(data => 'name' in data && 'symbol' in data && 'decimals' in data && 'initialSupply' in data && 'tokenOwner' && 'networks' in data, {
    message: 'Los datos de entrada deben tener las llaves "name" "symbol" "decimals" "initialSupply" "tokenOwner", "networks".',
});


const CreateCollectionNFTSchema = z.object({
    name: z.string().min(1, "El nombre es requerido."),
    symbol: z.string().min(1, "El símbolo es requerido."),
    initialOwner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum no válida."),
    maxSupply: z.number().int().min(0, "El suministro máximo debe ser 0 o mayor."),
    networks: z.array(z.enum(['localhost', 'fuji'])).min(1, "Debe especificar al menos una red."),
    initialURI: z.string(),  // URI opcional
  });

// export all methods
module.exports = {
    CreateTokenSchema,
    CreateCollectionNFTSchema
};