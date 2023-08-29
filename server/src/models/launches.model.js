const axios = require("axios");
const launches = require(".//launches.mongo");
const planets = require("./launches.mongo");

// const launches = new Map();

// let latestFlightNumber = 100;
const DEFAULT_FLIGHT_NUMBER = 0;

// const launch = {
//   flightNumber: 100,
//   mission: "Kepler Exploration X",
//   rocker: "Explorer IS1",
//   launchDate: new Date("December 27, 2030"),
//   target: "Kepler-442-b",
//   customer: ["ZTM", "NASA"],
//   upcoming: true,
//   success: true,
// };

// saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

// adding data to the db
async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    option: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  // validating the status code:
  if (response.status !== 200) {
    console.log("error downloading the data");
    throw new Error("launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => payload["customers"]);

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocker: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers,
    };
    await saveLaunch(launch);
  }
}

// loading launches data from external api
async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (findLaunch) {
    console.log("launch already esists");
    return;
  } else {
    await populateLaunches();
  }
}

// launches.set(launch.flightNumber, launch);

async function findLaunch(filter) {
  return await launches.find(filter);
}

async function existsLaunchWithId(launchId) {
  // return launches.has(launchId);
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values())
  // getting all document from collection
  await launches.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
    .sort({ flightNumber: 1 })
    .skip(skip)
  ).limit(limit);
}

// saving launches to database
async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  // validation
  const planet = planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet was found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber,
//         Object.assign(launch, {
//             success: true,
//             upcoming: true,
//             customers: ['ZTM', 'NASA'],
//             flightNumber: latestFlightNumber,
//         })
//     )
// }

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  loadLaunchesData,
};
