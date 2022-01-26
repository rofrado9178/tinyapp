//requiring all module needed
const { Template } = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

//user body parser
app.use(bodyParser.urlencoded({ extended: true }));

//use cookieparser
app.use(cookieParser());

//set engine so we can read ejs file from views folder and render it as html file
app.set("view engine", "ejs");

//temporary database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
//example
// app.get("/", (req, res) => {
//   res.send("Hello");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: "Hello World!" };
//   res.render("hello_world", templateVars);
// });

//get request from server for several path
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res.statusCode(400);
  }

  for (const key in users) {
    if (users[key].email === email) {
      console.log("Email already exists");
      return res.send("Email already exists");
    }
  }
  users[newID] = {
    id: newID,
    email,
    password,
  };
  res.cookie("user_id", newID);
  console.log(users);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]["email"],
  };
  res.render("urls_index", templateVars);
});
//post request and generate random shortURL and store it to database, and redirect the page
app.post("/urls", (req, res) => {
  const shortRandomUrl = generateRandomString();
  urlDatabase[shortRandomUrl] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortRandomUrl}`);
});

//manage login and cookies
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//update
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]["email"],
  };
  res.render("urls_new", templateVars);
});
//use the shortURL as a key to open the long url as a value
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: users[req.cookies["user_id"]]["email"],
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
  console.log(users);
});
