const mongoose = require('mongoose');

const hosts = [
  'ac-1raog1k-shard-00-00.mlqv81y.mongodb.net',
  'ac-1raog1k-shard-00-01.mlqv81y.mongodb.net',
  'ac-1raog1k-shard-00-02.mlqv81y.mongodb.net'
];

async function findPrimary() {
  for (const host of hosts) {
    try {
      console.log('Testing', host);
      const uri = `mongodb://irsath07:MIrsath2005@${host}:27017/fitness-tracker?ssl=true&authSource=admin&directConnection=true`;
      
      const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
      
      const adminDb = conn.db.admin();
      const info = await adminDb.command({ hello: 1 });
      
      if (info.isWritablePrimary) {
        console.log(`\n✅ PRIMARY FOUND: ${host}`);
        process.exit(0);
      } else {
        console.log(`❌ SECONDARY: ${host}`);
      }
      await conn.close();
    } catch (err) {
      console.error(`Error on ${host}:`, err.message);
    }
  }
  console.log('No primary found.');
  process.exit(1);
}

findPrimary();
