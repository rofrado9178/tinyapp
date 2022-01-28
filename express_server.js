//requiring all module needed
const { Template } = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const cookieSession = require("cookie-session");
const { v4: uuidv4 } = require("uuid");
const searchUserByEmail = require("./helper");

const app = express();
const PORT = 8080;

//using middleware
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: [
      "d630f505-af6b-424e-a221-3c4cd376ca80",
      "5933f1c9-77cc-4b4a-a260-5adc129966b0",
    ],
  })
);

//set engine so we can read ejs file from views folder and render it as html file
app.set("view engine", "ejs");

//temporary database
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt),
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt),
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

const urlsForUser = (id, database) => {
  let userURLS = {};
  for (const shortUrl in database) {
    if (database[shortUrl].userID === id) {
      userURLS[shortUrl] = database[shortUrl];
    }
  }
  return userURLS;
};

//handling /register path
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[userId],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = searchUserByEmail(email, users);
  console.log("user.email:", user);
  if (email === "" || password === "") {
    return res
      .status(403)
      .send(
        "Email or Password cannot be empty!. click here for <a href='/register'>Register</a>"
      );
  }

  if (user) {
    console.log("Email already exists");
    return res
      .status(403)
      .send(
        "Email already exists. click here for <a href='/register'>Register</a>"
      );
  }

  users[newID] = {
    id: newID,
    email,
    password: bcrypt.hashSync(password, salt),
  };
  req.session.user_id = newID;
  console.log(users);
  res.redirect("/urls");
});

//still get error message
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

// /urls path
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const userURLS = urlsForUser(userId, urlDatabase);
  const templateVars = {
    urls: userURLS,
    user: users[userId],
  };
  console.log(userURLS);
  if (userId) {
    res.render("urls_index", templateVars);
  } else {
    return res.status(404).send("Please <a href='/login'>Login<a>");
  }
});

app.post("/urls", (req, res) => {
  const shortRandomUrl = generateRandomString();
  const userId = req.session.user_id;
  urlDatabase[shortRandomUrl] = { longURL: req.body.longURL, userID: userId };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortRandomUrl}`);
});

//manage login and cookies and logout
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = searchUserByEmail(email, users);
  console.log("user", user);
  if (email === "" || password === "") {
    return res
      .status(403)
      .send(
        "Email or Password cannot be empty! click here for <a href='/login'>login</a>"
      );
  }

  if (user && bcrypt.compareSync(password, user.password)) {
    console.log(password);
    console.log("user Password:", user.password);
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else if (user.email !== email || user.password !== password) {
    return res
      .status(403)
      .send(
        "Email or Password is Incorrect! click here for <a href='/login'>login</a>"
      );
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

//update
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    console.log(userId);
    const templateVars = {
      urls: urlDatabase,
      user: users[userId],
    };
    console.log(urlDatabase);
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
//use the shortURL as a key to open the long url as a value
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortUrl = req.params.shortURL;
  // const userURLS ;

  if (!urlDatabase[shortUrl]) {
    res
      .status(404)
      .send(
        "The URL Does not exists, please check your URL Address.Url does not exists."
      );
  } else if (urlDatabase[shortUrl].userID !== userId) {
    res
      .status(404)
      .send("Please <a href='/login'>Login</a> to Access the URL.");
  } else if (userId) {
    const templateVars = {
      shortURL: shortUrl,
      longURL: urlDatabase[shortUrl].longURL,
      user: users[userId],
    };
    console.log();
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
  console.log(shortUrl);
});

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  if (!urlDatabase[shortUrl]) {
    return res
      .status(404)
      .send("The URL Does not exists, please check your URL Address.");
  }
  const longURL = urlDatabase[shortUrl].longURL;
  res.redirect(longURL);
});

//delete post
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(404).send("Does not have authorize to delete this url ");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//update post
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortUrl = req.params.shortURL;
  const userURLS = urlsForUser(userId, urlDatabase);
  console.log("userURLS:", userURLS);
  if (!userURLS[shortUrl]) {
    res.status(403).send("Does not have authorize to edit the url.");
  }
  urlDatabase[shortUrl].longURL = req.body.longURL;
  console.log(shortUrl);
  res.redirect(`/urls`);
});

//listening port 8080 and console log the port everytime we connect to the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
  console.log(users);
});
