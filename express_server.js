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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
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

//handling /register path
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res
      .status(403)
      .send(
        "Email or Password cannot be empty!. click here for <a href='/register'>Register</a>"
      );
  }

  for (const key in users) {
    if (users[key].email === email) {
      console.log("Email already exists");
      return res
        .status(403)
        .send(
          "Email already exists. click here for <a href='/register'>Register</a>"
        );
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

// /urls path
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    console.log(userId);
    const templateVars = {
      urls: urlDatabase,
      user: users[userId],
      // user_id: users[req.cookies["user_id"]]["email"],
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  const shortRandomUrl = generateRandomString();
  const userId = req.cookies["user_id"];
  urlDatabase[shortRandomUrl] = { longURL: req.body.longURL, userID: userId };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortRandomUrl}`);
});

//manage login and cookies and logout
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  console.log(userId);
  const templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res
      .status(403)
      .send(
        "Email or Password cannot be empty! click here for <a href='/login'>login</a>"
      );
  }

  for (const key in users) {
    if (users[key].email === email && users[key].password === password) {
      console.log(password);
      res.cookie("user_id", users[key].id);
      res.redirect("/urls");
      break;
    } else if (users[key].email !== email || users[key].password !== password) {
      return res
        .status(403)
        .send(
          "Email or Password is Incorrect! click here for <a href='/login'>login</a>"
        );
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//update
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    console.log(userId);
    const templateVars = {
      urls: urlDatabase,
      user: users[userId],
      // user_id: users[req.cookies["user_id"]]["email"],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
//use the shortURL as a key to open the long url as a value
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[userId],
    };
    console.log();
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//delete post
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//update post
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  console.log();
  res.redirect(`/urls/${req.params.shortURL}`);
});

//listening port 8080 and console log the port everytime we connect to the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
  console.log(users);
});
