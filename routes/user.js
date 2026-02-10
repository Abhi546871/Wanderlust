const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const {saveRedirectUrl} = require('../middleware.js');
const userController = require('../controllers/user.js');

router.route('/signup')
//Render a signup form
.get(userController.renderSignUpForm)
//Post a signup form 
.post(wrapAsync(userController.signup));


router.route('/login')
//Render Login Form
.get(userController.renderLoginForm)
//Post Login form
.post(
    saveRedirectUrl,
    passport.authenticate('local',{
    failureRedirect:'login',
    failureFlash:true,})
    ,userController.login)

router.get('/logout',userController.logout);


module.exports = router;