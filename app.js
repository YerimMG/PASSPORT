require("dotenv").config();
const bodyParser      = require("body-parser");
const cookieParser    = require("cookie-parser");
const express         = require("express");
const favicon         = require("serve-favicon");
// const hbs             = require("hbs");
const mongoose        = require("mongoose");
const logger          = require("morgan");
const path            = require("path");
const session         = require("express-session");
const bcryptjs        = require("bcryptjs");
const passport        = require("passport");
const LocalStrategy   = require("passport-local").Strategy;
const User            = require("./models/User");
const flash           = require("connect-flash");
const GoogleStrategy  = require("passport-google-oauth").OAuth2Strategy;
const GitHubStrategy  = require("passport-github").Strategy;
const cors            = require('cors')


mongoose
  .connect("mongodb://localhost/passportdemo", {
    useNewUrlParser: true
  })

  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);
const app = express();

// Middleware Setup

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));
app.use(
  session({
    secret: "our-passport-local-strategy-app",
    resave: true,
    saveUninitialized: true
  })
);
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});
passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});
app.use(flash());
passport.use(new LocalStrategy({passReqToCallback:true},(req, username, password, next) => {
    User.findOne({username},
      (err, user) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(null, false, {
            message: "Incorrect username"
          });
        }
        if (!bcryptjs.compareSync(password, user.password)) {
          return next(null, false, {
            message: "Incorrect password"
          });
        }
        return next(null, user);
      }
    );
  })
);
passport.use(
  new GoogleStrategy(
    {
      clientID:"408592629252-c8q8nkktk8jrc0dg923at9hu0cbjsd4v.apps.googleusercontent.com",
      clientSecret: "DM88-SFViaP82vH6jbfJ5eT6",
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleID: profile.id })
        .then(user => {

          if (user) {
            return done(null, user);
          }
          const newUser = new User({
            googleID: profile.id
          });
          newUser.save().then(user => {
            done(null, newUser);
          });
        })
        .catch(error => {
          done(error);
        });
    }
  )
);  

passport.use(
  new GitHubStrategy(
    {
      clientID: "c2026e5ab62f2279da0b",
      clientSecret: "99b6daf03c523d8d551ad95e193144e7721c733d",
      callbackURL: "http://localhost:3000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      User.findOne({ githubId: profile.id })
        .then(user => {
          if (user) {
            return cb(null, user);
          }
          const newUser = new User({
            githubId: profile.id
          });
          newUser.save().then(user => {
            cb(null, newUser);
          });
        })
        .catch(error => {
          cb(error);
        });;
    }
  )
);


app.use(passport.initialize());
app.use(passport.session());
app.use(cors())






// default value for title local

  app.locals.title = "Express - Generated with IronGenerator";



  const index = require('./routes/index');
  app.use('/', index);

// Routes

  const authRoutes = require("./routes/auth-routes");
  app.use("/", authRoutes);




module.exports = app;
