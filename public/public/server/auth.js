const express = require("express");
const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;

const router = express.Router();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "https://your-backend-url.up.railway.app/auth/twitter/callback"
},
(token, tokenSecret, profile, cb) => {
  return cb(null, {
    name: profile.displayName,
    avatar: profile.photos[0].value
  });
}));

router.get("/twitter", passport.authenticate("twitter"));

router.get("/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`/play.html?name=${encodeURIComponent(req.user.name)}&avatar=${encodeURIComponent(req.user.avatar)}`);
  }
);

module.exports = router;
