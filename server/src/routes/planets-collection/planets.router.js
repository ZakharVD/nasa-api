const express = require('express');
const { httpGetAllPlanets } = require('./planets.controllers')

const planetsRouter = express.Router();

planetsRouter.get('/planets', httpGetAllPlanets);

module.exports = planetsRouter;