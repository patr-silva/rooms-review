const router = require("express").Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const saltRounds = 10;
const User = require("../models/User.model");
const Room = require("../models/Room.model");


// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", isLoggedOut, (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your email.",
    });
  }

  if (password.length < 8) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  if (!fullName) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your name.",
    });
  }

  User.findOne({ email }).then((found) => {
    if (found) {
      return res
        .status(400)
        .render("auth.signup", { errorMessage: "Email already taken." });
    }

    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({
          email,
          password: hashedPassword,
        });
      })
      .then((user) => {
        req.session.user = user;
        res.redirect("/auth/login");
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).render("auth/signup", {
            errorMessage:
              "The  email you chose is already in use.",
          });
        }
        return res
          .status(500)
          .render("auth/signup", { errorMessage: error.message });
      });
  });
});

router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

router.post("/login", isLoggedOut, (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).render("auth/login", {
      errorMessage: "Please provide your email.",
    });
  }

  if (password.length < 8) {
    return res.status(400).render("auth/login", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).render("auth/login", {
          errorMessage: "Wrong credentials.",
        });
      }
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).render("auth/login", {
            errorMessage: "Wrong credentials.",
          });
        }
        req.session.user = user;
        // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
        return res.redirect("/auth/rooms");
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("auth/logout", { errorMessage: err.message });
    }
    res.redirect("/");
  });
});

router.get("/rooms", (req, res) => {
  res.render("auth/rooms")
})

router.get('/roomscreate', (req, res) => {
  res.render('auth/roomscreate');
});

router.post('/roomscreate', (req, res) => {
  const { name, description, imageUrl, owner } = req.body;
  Room.create({name, description, imageUrl, owner})
  .then(() => res.redirect("/roomslist"))
  .catch((error) => next(error));
});

router.get('/roomslist', (req, res) => {
  Room.find()
  .then((allRoomsfromDB) => {
   console.log(allRoomsfromDB, {rooms: allRoomsfromDB}) 
  })
  res.render('auth/list');
});




module.exports = router;
