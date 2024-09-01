// Utilizar funcionalidades del Ecmascript 6
'use strict'
// Cargamos los módulos de express y body-parser
var express = require('express');
var bodyParser = require('body-parser');
// Llamamos a express para poder crear el servidor
var app = express();
// Importamos las rutas
var router = require('./api/routers/router'); 
var routerGame = require('./api/routers/gamerouter'); 
var routerFortune = require('./api/routers/fortunerouter'); 
//cargar middlewares
//un metodo que se ejecuta antes que llegue a un controlador
//Configuramos bodyParser para que convierta el body de nuestras peticiones a JSON
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// Cargamos las rutas
app.use('/api', router);
app.use('/api', routerGame);
app.use('/api', routerFortune);
// exportamos este módulo para poder usar la variable app fuera de este archivo
module.exports = app;