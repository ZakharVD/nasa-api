const http = require("http");
const app = require("./app");
const mongoose = require('mongoose');
const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchesData } = require('./models/launches.model')

const PORT = process.env.PORT || 8000;

const MONGO_URL = 'mongodb+srv://ZakharVD:TkWySvxqN4AgRS5u@clusterfirst.2qtin4e.mongodb.net/?retryWrites=true&w=majority'

const server = http.createServer(app);

mongoose.connection.once('open', () => console.log('MondoDB connected'));
mongoose.connection.on('error', (err) => console.error(err));

async function onServerStart() {
  await mongoose.connect(MONGO_URL)
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}

onServerStart();