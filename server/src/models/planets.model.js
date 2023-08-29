const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
        .pipe(parse({
          comment: '#',
          columns: true,
        }))
        .on('data', async (data) => {
          if (isHabitablePlanet(data)) {
            // save to database (passing the data as it is defined in the schema) and update the data only if it changes
            savePlanet(data);
          }
        })
        .on('error', (err) => {
          console.log(err);
          reject(err);
        })
        .on('end', async () => {
          const countPlanetsFound = (await getAllPlanets()).length
          console.log(`${countPlanetsFound} habitable planets found!`);
          resolve();
        });
    })
}

async function getAllPlanets() {
  return await planets.find({});
}

async function savePlanet(planet) {
   // save to database (passing the data as it is defined in the schema) and update the data only if it changes
 try {
  await planets.updateOne({
    keplerName: planet.kepler_name,
  }, {
    keplerName: planet.kepler_name,
  }, {
    upsert: true,
  })
 } catch (error) {
    console.error('error saving planets to db', error);
 }
}

  module.exports = {
    loadPlanetsData,
    getAllPlanets,
  }