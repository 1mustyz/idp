var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const passport = require('passport');


/** All post request *//////////////////////////////////////////////

// register staff route
router.post('/register-refugee',  adminController.registerRefugee)

// add image to an event
// router.put('/trigger-notification',  adminController.uploadMedias)
// router.put('/upload-a-video',  adminController.uploadVideo)

// set profie pic
// router.put('/set-profile-pic',  adminController.setProfilePic)

// edit refugee page event
router.put('/edit-refugee', adminController.editRefugee)


// login staff
router.post('/login', adminController.loginAdmin)


// /** All get request *///////////////////////////////////////////////////////////////

// get all refugee
router.get('/get-all-Refugee', adminController.findAllRefugee)


// get single refugee
router.get('/get-single-refugee', adminController.singleRefugee)

// // get all company emergencies
// router.get('/get-all-company-emergencies', adminController.getEmergencies)

// // get single emergency
// router.get('/get-single-emergency', adminController.getSingleEmergency)

// // remove emergency
// router.put('/remove-emergency', adminController.deleteEmergency)

// // remove department program
// router.delete('/remove-company', adminController.removeCompany)


module.exports = router;