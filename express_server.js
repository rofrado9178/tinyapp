//requiring all module needed
const { Template } = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

//user body parser
app.use(bodyParser.urlencoded({ extended: true }));

//set engine so we can read ejs file from views folder and render it as html file
app.set("view engine", "ejs");

//temporary database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//generate 6 random alpha numeric function
const generateRandomString = () => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let alphanumeric = "";
  for (let i = 0; i < 6; i++) {
    alphanumeric += possible.charAt(Math.random() * possible.length);
  }
  return alphanumeric;
};

//get request from server for several path
app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//post request and generate random shortURL and store it to database, and redirect the page
app.post("/urls", (req, res) => {
  const shortRandomUrl = generateRandomString();
  urlDatabase[shortRandomUrl] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortRandomUrl}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {};
  res.render("urls_new");
});
//use the shortURL as a key to open the long url as a value
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//delete post
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//update post
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

//listening port 8080 and console log the port everytime we connect to the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
