const mongoose = require('mongoose');

async function test() {
  try {
    const uri = 'mongodb://irsath07:MIrsath2005@ac-1raog1k-shard-00-00.mlqv81y.mongodb.net:27017,ac-1raog1k-shard-00-01.mlqv81y.mongodb.net:27017,ac-1raog1k-shard-00-02.mlqv81y.mongodb.net:27017/fitness-tracker?ssl=true&replicaSet=atlas-1raog1k-shard-0&authSource=admin&retryWrites=true&w=majority';
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Success');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}
test();
