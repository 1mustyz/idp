const Refugee = require('../models/refuges')
const passport = require('passport');
const multer = require('multer');
const {singleUpload,singleAllMediaUpload,singleAudioUpload} = require('../middlewares/filesMiddleware');
const { uuid } = require('uuidv4');
const jwt =require('jsonwebtoken');
const csv = require('csv-parser')
const fs = require('fs')
const msToTime = require('../middlewares/timeMiddleware')
const math = require('../middlewares/math.middleware')
const randomstring = require("randomstring");
const cloudinary = require('cloudinary');
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox09949278db4c4a108c6c1d3d1fefe2ff.mailgun.org";
const mg = mailgun({apiKey: "9bd20544d943a291e8833abd9e0c9908-76f111c4-8a189b96", domain: DOMAIN});
const cloudinaryUplouder = require('../middlewares/uploadCloudinary')

// cloudinary configuration for saving files
cloudinary.config({
    cloud_name: 'mustyz',
    api_key: '727865786596545',
    api_secret: 'HpUmMxoW8BkmIRDWq_g2-5J2mD8'
})


// staff registration controller
exports.registerRefugee = async (req, res, next) => {
  
    try {

      //create the user instance
      req.body.username = randomstring.generate(10)
      user = new Refugee(req.body)
      const password = req.body.password ? req.body.password : 'password'
      //save the user to the DB
      await Refugee.register(user, password, function (error, user) {
        if (error) return res.json({ success: false, error }) 
        const newUser = {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          gender: user.gender,
          dob: user.dob,
          typeOfOrphan: user.typeOfOrphan,
          stateOfOrigin: user.stateOfOrigin,
          lga: user.lga,
          mothersName: user.mothersName,
          fathersName: user.fathersName,
          address: user.address,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          __v: user.__v
        }
        const data = {
          from: "MAU@gmail.com",
          to: "onemustyfc@gmail.com",
          subject: "MAU DEFAULT PASSWORD",
          text: "Your default password is 'password'"
        };
        try {
          
          mg.messages().send(data, function (error, body) {
            console.log(body);
          });
          res.json({ success: true, newUser })
        } catch (error) {
          res.json({ success: false, newUser })
        }
      })
    } catch (error) {
      res.json({ success: false, error })
    }
  }

  // reset password
  exports.changePassword = async (req, res, next) => {
    const {username} = req.query
    Refugee.findOne({ username },(err, user) => {
      // Check if error connecting
      if (err) {
        res.json({ success: false, message: err }); // Return error
      } else {
        // Check if user was found in database
        if (!user) {
          res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
        } else {
          user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) {
             if(err) {
                      if(err.name === 'IncorrectPasswordError'){
                           res.json({ success: false, message: 'Incorrect password' }); // Return error
                      }else {
                          res.json({ success: false, message: 'Something went wrong!! Please try again after sometimes.' });
                      }
            } else {
              res.json({ success: true, message: 'Your password has been changed successfully' });
             }
           })
        }
      }
    });
  }

exports.forgetPassword = async (req,res,next) => {

  const newPassword = math.randomNumber()
  try {

      const user = await Refugee.findOne({
        username: req.query.username
    });
    await user.setPassword(newPassword.toString());
    const updatedUser = await user.save();
    const data = {
      from: "MAU@gmail.com",
      to: "onemustyfc@gmail.com",
      subject: "CHANGED PASSWORD",
      text: `Your new password is ${newPassword}`
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });
    res.json({success:true, message:"Password have been reset and sent to email"})
  } catch (error) {
    res.json({success:false, message:error})
  }
    
}

  // staff login controller
exports.loginAdmin = (req, res, next) => {

  let payLoad = {}
  // perform authentication
  passport.authenticate('refugee', (error, user, info) => {
    if (error) return res.json({ success: false, error })
    if (!user)
      return res.json({
        success: false,
        message: 'username or password is incorrect'
      })
    //login the user  
    req.login(user, (error) => {
      if (error){
        res.json({ success: false, message: 'something went wrong pls try again' })
      }else {
        req.session.user = user
        payLoad.id = user.username
        const token = jwt.sign(payLoad, 'myVerySecret');

        const newUser = {
          token: token,
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          gender: user.gender,
          dob: user.dob,
          typeOfOrphan: user.typeOfOrphan,
          stateOfOrigin: user.stateOfOrigin,
          lga: user.lga,
          mothersName: user.mothersName,
          fathersName: user.fathersName,
          address: user.address,
          image: user.image,
          admin: user.admin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          __v: user.__v
        }
        
        res.json({ success: true, message: 'admin login successful', newUser})
      }
    })
  })(req, res, next)
}

 


// find all refugee
exports.findAllRefugee = async (req,res, next) => {

  try {
    const result = await Refugee.find({admin:false});
    result.length > 0
    ? res.json({success: true, message: result,})
    : res.json({success: false, message: result,})
  } catch (error) {
    console.log(error)
  }
  
}


// find single refugee
exports.singleRefugee = async (req,res, next) => {
  const {username} = req.query
  try {
    const result = await Refugee.findOne({username: username});
    result
     ? res.json({success: true, message: result,})
     : res.json({success: false, message: result,})
    
  } catch (error) {
    console.log(error)
  }
}

// set profile pic
exports.setProfilePic = async (req,res, next) => {
  
  singleUpload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
    return res.json(err.message);
    }
    else if (err) {
      return res.json(err);
    }
    else if (!req.file) {
      return res.json({"image": req.file, "msg":'Please select an image to upload'});
    }
    if(req.file){

      
        const result = await Refugee.findOne({username: req.query.username},{_id: 0,image: 1})
        

        if (result.image != null){
          const imageName = result.image.split('/').splice(7)
          console.log('-----------------',imageName)
  
          cloudinary.v2.api.delete_resources_by_prefix(imageName[0], 
          {
            invalidate: true,
            resource_type: "raw"
        }, 
          function(error,result) {
            console.log(result, error) 
          }); 
        }

      cloudinary.v2.uploader.upload(req.file.path, 
        { resource_type: "raw" }, 
        async function(error, result) {
        console.log('111111111111111111',result, error); 

        
        await Refugee.findOneAndUpdate({username: req.query.username},{$set: {image: result.secure_url}})
        const editedRefugee = await Refugee.findOne({username: req.query.username})
        
        res.json({success: true,
          message: editedRefugee,
                     },
        
    );
        });
     
       
    }
       
    });

    
        
  
}

// edit refugee
exports.editRefugee = async (req,res,next) => {
  try {
    const {username} = req.query;
    await Refugee.findOneAndUpdate({username: username}, req.body)
    res.json({success: true, message: `Refugee with the ID ${username} has been edited`})
    
  } catch (error) {
    console.log(error)
  }
}


