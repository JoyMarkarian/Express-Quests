require("dotenv").config();

const express = require("express");
const { hashPassword, verifyPassword, verifyToken, verifyPayload } = require("./auth");
const userHandlers = require("./userHandlers");
const movieHandlers = require("./movieHandlers");

const app = express();

app.use(express.json());

const port = process.env.APP_PORT ?? 5000;


const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome);

// the public routes

app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);

app.post("/api/users", hashPassword, userHandlers.postUser);

app.post(
  "/api/login",
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
); // /!\ login should be a public route

// then the routes to protect

app.use(verifyToken); // authentication wall : verifyToken is activated for each route after this line

app.post("/api/movies", movieHandlers.postMovie);
app.put("/api/movies/:id", movieHandlers.updateMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);

app.put("/api/users/:id", verifyPayload, userHandlers.updateUser);
app.delete("/api/users/:id", verifyPayload, userHandlers.deleteUser);

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
