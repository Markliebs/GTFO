var express = require('express');
var bodyParser = require('body-parser');
var orm = require('../config/orm.js');
var items = require('../public/assets/js/app.js');
var UserModel = require('../models/User.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('../routes.js');
var app = express();

//Setting the strategy for Passport
passport.use(new LocalStrategy({passReqToCallback : true},
  function(req, username, password, done) {

  	//Searching the ORM for the user in the database
  	orm.findUser(username, function(err, user){
  		user = user[0];
  		if (err) { return done(err); }
      if (!user) { return done(null, false); }

      //comparing user passwords - return if not a match
      if (password !== user.password) { return done(null, false);}

      return done(null, user);
  	});
  }
));

//These two methods are required to keep the user logged in via the session
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

	// {name: "Placeholder", roomClass: "placeholder", frameClass: "frameIMG", text: 'you see me', button1: "item1", button2: "item2"}

var gameData = [
	{name: "Bedroom", roomClass: "bedroom", frameClass: "frameIMG", text: 'you see me', button1: items.winArray[1], button2: items.otherArray[1]},
	{name: "Library", roomClass: "library", frameClass: "frameIMG", text: 'you see me', button1: items.winArray[2], button2: items.otherArray[2]},
	{name: "Maid's Room", roomClass: "maidsRoom", frameClass: "frameIMG", text: 'you see me', button1: items.otherArray[0], button2: items.winArray[0]},
];

module.exports = function(app){


		app.get('/', function(req, res){
			res.render('home', {			
				welcomeText: "Sign In",
				actionBtn: 'signin',
				message: req.flash('error')[0],
				otherAction: "Signup"
			});
		});

		app.get('/signin', function(req, res){
		res.redirect('/')
	});

		app.get('/signup', function(req, res){
		res.render('index', {
			welcomeText: "Sign Up",
			actionBtn: 'signup',
			otherAction: "Signin"
		});
	});

		app.get('/authenticated', function(req,res){
		if (req.isAuthenticated()) {
			res.render('authenticated', {
				username: req.user.username
			})
		} else {
			res.redirect('/')
		}
	});


		if(gameData.length > 0){
			
		app.get('/game', function(req, res){
			var randomIndex = Math.floor(Math.random()*gameData.length);
			var chosen = gameData[randomIndex];
			// background.splice(chosen)
			console.log(chosen);
			res.render('game', chosen);
			gameData.splice(randomIndex, 1);
		console.log(gameData);
		});
	
		app.post('/signin', passport.authenticate('local',{failureRedirect:'/', failureFlash:'Wrong Username or Password'}), function(req, res){
		res.redirect('/authenticated');
	});

	app.post('/signup', function(req, res){
		var user = new UserModel(req.body);
		UserModel.saveUser(user, function(status){
			if(!status) {
				res.redirect('/signup')
				return false
			}
			res.redirect('/');
		});
	});

};

	}
}