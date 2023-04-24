/*We ran 'npm run build' to generate the 'build' folder in the FE folder and copied the same to
the BE folder. While developing FE, it is React's built-in dev server that hosts the app. But,
in production, the app needs to be hosted by a node server. */

import express from "express";
import { connectToDb, db } from "./db.js";
//to connect to the DB:
//import { MongoClient } from "mongodb";
import fs from "fs";
import admin from "firebase-admin";

import "dotenv/config";

import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//dummy storage (in reality, we use a DB like Mongo):
/*
let articlesInfo = [
  {
    name: "learn-react",
    upvotes: 0,
    comments: [],
  },
  {
    name: "learn-node",
    upvotes: 0,
    comments: [],
  },
  {
    name: "mongodb",
    upvotes: 0,
    comments: [],
  },
];
*/

const credentials = JSON.parse(fs.readFileSync("./credentials.json"));
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const app = express();
app.use(express.json());
/*We need to make the node server serve the 'build' files statically. For this, we 'tell' express
to use that 'build' folder as a static folder: */
app.use(express.static(path.join(__dirname, "../build")));

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

/*We use the authtoken that is going to be included in every request coming from the FE in
order to load info about that user from firebase */
app.use(async (req, res, next) => {
  const { authtoken } = req.headers;
  if (authtoken) {
    try {
      /*This is going to verify that the authtoken is valid and load the corresponding user for
      that authtoken: */
      req.user = await admin.auth().verifyIdToken(authtoken);
    } catch (e) {
      return res.sendStatus(400);
    }
  }
  req.user = req.user || {};
  next();
});

//endpoint for loading article info from mongodb:
app.get("/api/articles/:name", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  // //connecting to the local mongo instance:
  // const client = new MongoClient("mongodb://17.0.0.1:27017");
  // await client.connect();
  // //getting the DB (equivalent of 'use react-blog-DB'):
  // const db = client.db("react-blog-DB");
  //we can create a different component function for the above 3 lines of db connection
  //The 'findOne' function allows to find a single document inside a mongodb collection:
  const article = await db.collection("articles").findOne({ name });
  //sending that found article back to the client:
  //res.send(article);
  //we can instead use res.json(), which makes sure that the correct headers are set on the response:
  if (article) {
    const upvoteIds = article.upvoteIds || [];
    article.canUpvote = uid && !upvoteIds.includes(uid);
    res.json(article);
  } else {
    res.sendStatus(404);
  }
});

app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
});

// creating an endpoint for upvotes:
app.put("/api/articles/:name/upvote", async (req, res) => {
  //which article to upvote:
  const { name } = req.params;
  const { uid } = req.user;
  //const article = articlesInfo.find((a) => a.name === name); // for dummy data
  // const client = new MongoClient("mongodb://17.0.0.1:27017");
  // await client.connect();
  // const db = client.db("react-blog-DB");
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    const upvoteIds = article.upvoteIds || [];
    const canUpvote = uid && !upvoteIds.include(uid);
    if (canUpvote) {
      //incrementing the 'upvote' property:
      await db.collection("articles").updateOne(
        { name }, //first parameter
        {
          $inc: { upvotes: 1 }, //second parameter
          $push: { upvoteIds: uid },
        }
      );
    }
    const updatedArticle = await db.collection("articles").findOne({ name });
    //res.send(`The ${name} article now has ${article.upvotes} upvotes`);
    res.json(updatedArticle);
  } else {
    res.send("That article doesn't exist!");
  }
});
/*Now, to test this, we can type this url in Postman and click on 'send':
http://localhost:8000/api/articles/learn-react/upvote */

//creating an endpoint for user comments:
app.post("/api/articles/:name/comments", async (req, res) => {
  const { name } = req.params;
  const { postedBy, text } = req.body;
  const { email } = req.user;
  //const article = articlesInfo.find((a) => a.name === name);
  // const client = new MongoClient("mongodb://17.0.0.1:27017");
  // await client.connect();
  // const db = client.db("react-blog-DB");
  await db.collection("articles").updateOne(
    { name },
    {
      $push: { comments: { postedBy: email, text } },
    }
  );
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    //article.comments.push({ postedBy, text });
    //res.send(article.comments);
    res.json(article);
  } else {
    res.send("That article doesn't exist!");
  }
});

const PORT = process.env.PORT || 8000;

connectToDb(() => {
  console.log("Successfully connected to the db!!");
  app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
  });
});
