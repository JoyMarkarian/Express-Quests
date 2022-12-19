require("dotenv").config();

const path = require ("path");
const express = require("express");
const Session = require('express-session');
const FileStore = require('session-file-store')(Session);
const { hashPassword, verifyPassword, verifyToken, verifyPayload } = require("./auth");
const userHandlers = require("./userHandlers");
const movieHandlers = require("./movieHandlers");

const app = express();

app.use(express.json());
app.use(Session({
  store: new FileStore({
      path: path.join(__dirname, '/tmp'),
      encrypt: true
  }),
  secret: 'Super Secret !',
  resave: true,
  saveUninitialized: true,
  name : 'sessionId'
}));

const port = process.env.APP_PORT ?? 5002;

const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome); 

app.get("/api/session-in", (req,res) => {
  req.session.song = "Be bop a lula";
  console.log("Test");
  res.send("Session variable change");
});

app.get("/api/session-out", (req,res) => {
  res.send(req.session.song);
});

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

// app.use(verifyToken); // authentication wall : verifyToken is activated for each route after this line

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
