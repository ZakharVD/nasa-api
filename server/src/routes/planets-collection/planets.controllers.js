const { getAllPlanets } = require('../../models/planets.model')

function httpGetAllPlanets(req, res) {
    return res.status(200).json(planets); // having a 'return' statement makes sure that the response was set only once.
}

module.exports = {
    httpGetAllPlanets,
}