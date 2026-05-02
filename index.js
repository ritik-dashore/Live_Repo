const express = require('express');
const app = express();
const dotenv = require('dotenv');
const session = require('express-session');
dotenv.config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const port = process.env.PORT || 3000;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.callbackURL
  },
  
  function(request, accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
    console.log('Google request:', request);
    console.log('Google accessToken:', accessToken);
    console.log('Google refreshToken:', refreshToken);
    console.log('Google profile:', profile);

      return done(null, profile);

  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
    
app.get('/', (req, res) => {
  res.send(`Hello, World 102!
    <a href="/auth/google">Login with Google</a>`);
});

app.get('/auth/google',
  passport.authenticate('google', { scope:
  	[ 'email', 'profile' ] }
));
 
app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/profile',
        failureRedirect: '/'
}));

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user);
    
    res.send(`<h1>Hello, ${req.user.displayName} </h1>
      <p>Email: ${req.user.emails[0].value}</p>
      <img src="${req.user.photos[0].value}" alt="Profile Picture" />
      <a href="/logout">Logout</a>`);
  } else {
    res.redirect('/auth/google');
  }
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});