require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", async function (req, res) {
  if (req.isAuthenticated()) {
    var foundUsers= await User.find({secret:{$ne:null}});
       
    res.render("secrets", {usersWithSecrets : foundUsers});
  } else {
    res.redirect("/login");
  }
});


app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", async function(req,res){
    const submittedSecret= req.body.secret;
    let check= await User.findOneAndUpdate({ _id : req.user.id }, {secret: submittedSecret});
    res.redirect("/secrets");
})

app.get("/logout", function(req,res){
    req.logout( function(err){
        if(err){
            console.log(err);
        }
    });
    res.redirect("/");
})


app.post("/login", passport.authenticate("local", {
  successRedirect: "/secrets",
  failureRedirect: "/login"
}));


app.post("/register", function (req, res) {
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});


// CODE FOR LOGIN PAGE(THE FORM THAT IT HAS) APP.POST 
// try{
//     let userEmail= req.body.username;
//     let userPassword= req.body.password;
    
//     let check= await User.findOne({ name : userEmail });
//     // if(check.password === userPassword){
//     //     res.redirect("/secrets");
//     // } else{
//     //     res.write("<h1>fuck you</h1>");
//     // }
//     bcrypt.compare(userPassword, check.password, function(err, result) {
//     if(result==true){
//         res.redirect("/secrets");
//     } else{
//          res.write("<h1>fuck you</h1>");
//     }
// });
//     } catch (err){
//         console.log(err);
//     }



//CODE FOR REGISTERING USER INTO THE APP AND VERIFYING THEM
//CODE FOR APP.POST IN REGISTER

//    try{ 
//     let userEmail= req.body.username;
//     let userPassword= req.body.password;
//    bcrypt.hash(userPassword, saltRounds, async function(err, hash) {
//     // Store hash in your password DB.
//     let newUser= new User({
//         name: userEmail,
//         password: hash
//     })
//     console.log(hash);
//      await newUser.save();
//      let check= await User.findOne({ name : userEmail});
//      if(check.name === userEmail){
//         res.redirect("/secrets");
//       } else{
//         res.send("FUCK YOU");
//       }
// });
//     }catch(err){
//         console.log(err);
//     }
    