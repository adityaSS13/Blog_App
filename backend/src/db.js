import { MongoClient } from "mongodb";

let db;

async function connectToDb(cb) {
  //connecting to the local mongo instance/local database:
  //const client = new MongoClient("mongodb://17.0.0.1:27017");
  //connecting to the DB created in mongodb atlas (non-local for production/release):
  const client = new MongoClient(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_USERNAME}@cluster0.tcd7ksy.mongodb.net/?retryWrites=true&w=majority`
  );
  await client.connect();
  //getting the DB (equivalent of 'use react-blog-DB'):
  db = client.db("react-blog-DB");
  cb();
}
export { db, connectToDb };
