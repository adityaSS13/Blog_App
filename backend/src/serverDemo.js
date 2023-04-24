import express from "express";
const app = express();

/*We can define different endpoints and what we want our server to do when one of those endpoints
receives a request: */
app.get("/hello", (req, res) => {
  res.send("Hello!");
});
/*When the app requests a 'get' request on an endpoint '/.hello', it'll respond with a message
'Hello!' */

// url parameters in express:
app.get("/hello/:name", (req, res) => {
  const { name } = req.params;
  res.send(`Hello ${name}!`);
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
