const mongoose = require('mongoose');
const dotenv = require('dotenv');

// read env variables
dotenv.config({ path: './config.env' });

// set DB connection
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// connect DB via mongoose
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  });
//.catch((err) => console.log('Error: Fail to connect remote MongoDB server.'));

const app = require('./app');

// set the app server port
const port = process.env.PORT || 3000;

// create app listening port
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// handle unhandled rejection arised from async, promise, await
process.on('unhandledRejection', (err) => {
  console.log('Catch unhandled rejection. Shutting down the server...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});

// handle uncaught exception arised from sync
process.on('uncaughtException', (err) => {
  console.log('Catch uncaught exception. Shutting down the server...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
