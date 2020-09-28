const express = require('express');
const router = express.Router();
const loginService = require('./login.service')
const config = require('../../config.json');

router.post('/authenticate', authenticate);
router.post('/forgotpasswordlinkgenerate', forgotpassword);
router.post('/resetpassword', resetpassword);
router.post('/logout', logout);
router.get('/forgotpassword/:userid/:token', userforgotpassword);
router.post('/emailverify', emailVerify);
router.post('/resendOtp', resendotp);
// router.delete('/delete_user/:id', del_user);

module.exports = router;

async function authenticate(req, res, next) {
    await loginService.authenticate(req.body,req)
   .then(user => user ? res.send({status:user.status,message:user.message,result:user.list}) : res.status(400).send({status:false ,message: 'Username or password is incorrect' }))
   .catch(err => next(err));
}

async function forgotpassword(req,res,next){
   
    loginService.passwordchange(req.body,req)
    .then(user => user ? res.send({status:true,message:user.message,result:user.list}) : res.status(400).send({status:false ,message: 'error' }))
    .catch(err => next(err));
}

async function resetpassword(req,res,next){
   
    loginService.resetuserPasseword(req.body,req)
    .then(user => user ? res.send({status:true,message:user.message,result:user.list}) : res.status(400).send({status:false ,message: 'error' }))
    .catch(err => next(err));
}

async function logout(req,res,next){
   
    loginService.logoutUser(req.body,req)
    .then(user => user ? res.send({status:true,message:user.message,result:user.list}) : res.status(400).send({status:false ,message: 'error' }))
    .catch(err => next(err));
}

async function userforgotpassword(req,res,next){
   UserID = req.params.userid;
   random = req.params.token;
   console.log(UserID)
   console.log(random)
   var resetlink = res.redirect(config.front_end_url+"reset/"+UserID+"/"+random);
   console.log(config.front_end_url+"reset/"+UserID+"/"+random)
   console.log(resetlink)
   return resetlink
}

async function emailVerify(req,res,next){
    loginService.emailverify(req.body,req)
    .then(user => user ? res.send({status:user.status,message:user.message,result:user.list}) : res.status(400).send({status:false ,message: 'error' }))
    .catch(err => next(err));
}

async function resendotp(req,res,next){
    loginService.otpresend(req.body,req)
    .then(user => user ? res.send({status:user.status,message:user.message,result:user.list}) : res.status(400).send({status:false ,message: 'error' }))
    .catch(err => next(err));
}