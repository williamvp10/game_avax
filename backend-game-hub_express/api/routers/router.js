'use strict'
// Cargamos el módulo de express para poder crear rutas
const express = require('express');
// Cargamos el controlador
const { createToken } = require('../controllers/createToken'); // Fix the file name to match the actual file name
const { createCrossChainToken } = require('../controllers/createCrossChainToken'); // Fix the file name to match the actual file name

//controllers NFT
const { createNFTCollection } = require('../controllers/nfts/createNFTCollection');

function descripcionApi(req, res) {
    return res.status(200).send({
        "descripcion":"Api game hackathon v1"
    });
}

// Llamamos al router
const api = express.Router();

//var md_auth = require('../middlewares/authenticated');


//create Token
api.post('/create-token',
    //funcion para imprimir en consola el json body
    (req, res, next) => {
        // validate zod schemas
        console.log(req.body);
        next();
    },    
    createToken
    );

api.post('/create-cross-chain-token',
    //funcion para imprimir en consola el json body
    (req, res, next) => {
            // validate zod schemas
            console.log(req.body);
            next();
    },    
    createCrossChainToken
    );

api.get('', descripcionApi);


//create NFTs
api.post('/create-nft-collection',
    //funcion para imprimir en consola el json body
    (req, res, next) => {
        // validate zod schemas
        console.log(req.body);
        next();
    },    
    createNFTCollection
    );

// Exportamos la configuración
module.exports = api;