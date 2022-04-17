var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const passport = require('passport');


/** All post request *//////////////////////////////////////////////

// register staff route
router.post('/register-refugee',  adminController.registerRefugee)

// set profie pic
router.put('/set-profile-pic',  adminController.setProfilePic)

// edit refugee page event
router.put('/edit-refugee', adminController.editRefugee)


// login staff
router.post('/login', adminController.loginAdmin)


// /** All get request *///////////////////////////////////////////////////////////////

// get all refugee
router.get('/get-all-Refugee', adminController.findAllRefugee)


// get single refugee
router.get('/get-single-refugee', adminController.singleRefugee)

module.exports = router;