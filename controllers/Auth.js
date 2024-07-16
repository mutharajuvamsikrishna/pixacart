const { Router } = require('express');
const express    = require('express');
const router     = express.Router();
const mongoose   = require('mongoose');
const UserModel  = mongoose.model('users');
const CategoryModel  = mongoose.model('category');
const SubCategoryModel  = mongoose.model('sub_category');
const md5        = require('md5');
const {validationResult} = require('express-validator');
const config     = require('../config/config');
const helper     = require('../helpers/my_helper');
const jwt 		   = require('jsonwebtoken');
const { v4 : uuid } = require('uuid');
const generatorPassword = require('generate-password');

const USER = {};
USER.api = {};
USER.login = async (req, res) => {
  let verifyType ='';
  let verifyMsg = '';
  if(req.query.type){
      verifyType = req.query.type;
  }
  if(req.query.msg){
      verifyMsg = req.query.msg;
  }
    res.render('authentication/login', {
        viewTitle : 'Login User',
        cookies   : req.cookies,
        verifyType : verifyType,
        verifyMsg : verifyMsg
    });
   
};

USER.register = async (req, res) => {
  res.render('authentication/register', {
      viewTitle : 'Register User'
  });
};

USER.forgot_password = async (req, res) => {
  res.render('authentication/forgot_pws', {
      viewTitle : 'Forgot Password'
  });
};

USER.dashboard = async (req, res) => {
 
  if (req.headers && req.headers.authorization) {
		const token = req.headers['authorization'].replace(/^JWT\s/, '')
		let decoded
    try {
	    decoded = jwt.verify(token, config.keys.secret)

		  // Fetch the user by id 
		  UserModel.findOne({fullName: decoded.username}).then(function(user){
			  // Do something with the user
			  res.status(200).json({
				  user,
			  });
		  });
    } catch(err) {
      res.status(200).json({message : err});
    }

	}else{
    res.status(200).json({message: 'Auth Token required.'});
  }
  
};

USER.logout = async (req, res) => {
	  req.session.destroy();
    res.clearCookie('AuthTkn');
	  res.redirect('/login');
};

USER.verify_email = async (req, res) => {
    try {
      const token = req.params.token;
      const user = await UserModel.findOne({verify_otp : token});
      let msg = '';
      let type = 'success';
      if (user){
          if (user.verify_otp != token) {
              msg = 'Incorrect OR Expired Link';
              type = 'failed';
            
          }else{
              user.verify_otp  = "";
              user.status = 1;
              await user.save();
              msg = 'Account verified successfully.';
              type = 'success';
          }
      }else{
          msg = 'Incorrect OR Expired Link';
          type = 'failed';
      }
      msg = 'Account verified successfully.';
      type = 'success';
      res.redirect('/login?type='+type+'&msg='+msg);
    } catch (err) {
      res.json({ status: 0,'message':err.message});
    }
  };



USER.api.login = async (req, res) => {
    try {
       UserModel.findOne({ email: req.body.uemail , role: { "$in": [1, 2] }, status : 1}, function(err,result){
        if(result) {
           let pwd =  req.body.pwd.trim();
           if(md5(pwd) == result.password){
            if(result.status == 0) {
                res.json({
                  status: 0,
                  message: `Your account is not active.`,
                  data:''
                });
                return;
              }
            
             if(result.status==3){
                res.json({ status	: 0, message:'The account is not verified please verify the account.'});
                return;
              }   
              if(result.status){
                if(req.body.remember_me){
                  res.cookie('email',req.body.uemail);
                  res.cookie('password',req.body.pwd);
                }else{
                  res.clearCookie('email');
                  res.clearCookie('password');
                }

                var userData = {
                  user_id		: result.id,
                  email	: result.email,
                  role	: result.role,
                  profile_image : result.profile_image,
                  fullname : result.fullname,
                  status : result.status,
                  loginAS : 'ADMIN'

                };

                if(userData.profile_image != null){
                  userData.profile_image = config.APP_URL+'uploads/users/'+userData.profile_image;
                }else{
                  userData.profile_image = config.USER_DEFAULT_IMAGE;
                }

                let redirectUrl = 'dashboard';
                if(userData.role == 2 && result.address ==null){
                    redirectUrl = 'profile';
                }

                const token = jwt.sign(userData,config.keys.secret, { expiresIn: '1d'});
                res.cookie('AuthTkn', token , { maxAge: 1000 * 60 * 15 }); // would expire after 15 minutes
                userData.token = token;
                req.session.user = userData;
                


                res.status(201).json({
                  status	: 1,
                  message	: "Logged in successfully.",
                  data:userData,
                  redirect : redirectUrl
                  //accessToken:token
                });
              }else{
                  res.status(401).json({message:'This Account is inactive.'})
              }
            }else{
              res.status(401).json({message:'Invalid login credentials.'})
            }
          }else{
            res.status(401).json({message:'We couldn\'t find the account with this email address.'})
          }
        })
      } catch (err) {
        res.status(401).json({'error':err})
      }
  };


  USER.api.register = async (req, res) => {
    try {

      if(req.body.umobile && !await helper.validatePhone(req.body.umobile)){
          res.json({status : 0 , message: 'Please enter valid mobile number.'});
          return;
      }
       UserModel.findOne({ email: {$regex : req.body.uemail , $options : 'i'}}, function(err,result){
        if(result) {
          res.status(401).json({status : 1 , message:'Email is already used.'})
        }else{
            let verifytoken = uuid();
            let newUser = new UserModel ({
              'fullname'     : req.body.uname,
              'email'        : req.body.uemail,
              'mobile'       : (req.body.umobile) ? req.body.umobile : '',
              'password'     : md5(req.body.pwd),
              'role'         : 2 ,  //req.body.user_type,
              'profile_image': null,
              'verify_otp'  : verifytoken ,
              'status'      : 3,
              
          });

          newUser.save( async function(err, Person){
            if(!err){
              let verify_link = `${config.APP_URL}auth/verify-email/${verifytoken}`;
              let htmlToSend = await helper.emailTemplate({name:req.body.uname, verify_link: verify_link} ,'sellerWelcome');
                helper.sendMail({
                    to		  : req.body.uemail,
                    subject	: `Verify your email - ${config.APP_NAME}`,
                    message	: htmlToSend,
                    hasHTML : true,
              })
              .then(info => {
                  res.json({status : 1, message:'Registered successfully <br> Activation link has been sent to your email please check your email.' });
              })
            .catch(error => {
              res.json({
                status:0,
                 message: 'Unable to send mail on your email, Please try again.',
                 data: error,
               });
             });
              
            }else{
              res.status(200).json({status : 0, message:'User not registered.'});
            }
              
          });

        }
      });

      } catch (err) {
        res.status(200).json({status : 0, message:'Something went wrong. '+err.message});
      }
  };

  USER.api.create_category = async (req, res)  => {

       let newCate = new CategoryModel ({
            'cate_name'    : 'modi',
            'cate_image'   : 'category image'
        });

        newCate.save(function(err, cate){
          if(!err){

            let newSubCate = new SubCategoryModel({
              'parent_id'    : cate._id,
              'cate_name'    : 'catenew',
              'cate_image'   : 'category imagexcxcxz'
            });

            newSubCate.save(function(err, subcate){
              if(!err){
                  SubCategoryModel.find().populate('parent_id').exec((err,result) =>{
                      res.status(200).json({status : 1, message:' Created.'+result});    
                  });
              }else{
                  res.status(200).json({status : 0, message:'not Created.'+err});
              }

            });
            
          }else{
              res.status(200).json({status : 0, message:'not Created.'+err});
          }
            
        });
  }


  USER.api.forgot_password = async (req, res)  => {
    try {
        await UserModel.find({'email' : req.body.forgot_email}).then(async (result)=>{
        if(result.length > 0){
          if(result[0].status == 0) {
            res.status(406).json({
              status: 0,
              message: `Your account is not active.`,
              data:''
            });
            return;
          }

          if(result[0].status==3){
              res.json({ status	: 0, message:'The account is not verified please verify the account.'});
              return;
          }
         // let token = uuid();
         var new_pwd = generatorPassword.generate({
                              length: 6,
                              numbers: true,
                              uppercase: false,
                              lowercase: false
                            });
          await UserModel.updateOne({'_id':result[0].id},{
           password: md5(new_pwd)
           
          }).then(async() => {
           
            let user = result[0];
           
            let htmlToSend = await helper.emailTemplate({name:user.fullname,email:user.email,new_pwd:new_pwd},'resetpassword');
            helper.sendMail({
             	to		: user.email,
             	subject	: `Password Reset - ${config.APP_NAME}`,
             	message	: htmlToSend,
             	hasHTML : true,
             })
             .then(info => {
             	res.status(200).json({
            		status:1,
           		  message: 'New password sent to your email please check your email.',
            		data:''
             	});
             })
           .catch(error => {
           	res.status(520).json({
           		status:0,
            		message: 'Unable to send password on your email, Please try again.',
            		data: error,
            	});
            });
          }).catch(error => {
            console.log(error)
          })
        } else {
          res.status(400).json({
            status : 0,
            message: `We couldn't find your account.`,
            data:''
          });
          return;
        }
      });
  
    } catch(err) {
          res.status(401).json({status : 0 , message: err.message});
    }
  };



module.exports = USER;