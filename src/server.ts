import mongoose from 'mongoose';
import config from './app/config';
import app from './app';

async function main() {
  try {
    await mongoose.connect(config.database_url as string); // As we are sure that this database_url is string, we forcefully make it's type string. Otherwise there could be a type error

    app.listen(config.port, () => {
      console.log(`App listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();
