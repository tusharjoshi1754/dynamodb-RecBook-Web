var uuid = require('uuid');
const db = require('../../helper/db');
const User = require('./login.model.ts');
const sha512 = require('js-sha512');
var jwt = require('jsonwebtoken');
var common_service = require('../../common_service')
var Token = require('./token.model.ts')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
const dateFormat = require('dateformat');
const ForgotToken = require('./forgottoken.model.ts')
const sendMail = require('../../helper/email')
const rn = require('random-number')
const config = require('../../config.json');
let sendMsg = require('aws-sns-sms');
let messageconfig = require("../../messageConfig.json")

module.exports = {
	authenticate,
	passwordchange,
	resetuserPasseword,
	logoutUser,
	emailverify,
	otpresend
}

async function authenticate(userparams) {
	var email = userparams.Email;
	var phone = userparams.PhoneNumber;
	var params = {
		TableName: "Users",
		ProjectionExpression: 'ID,UserName,Email,PhoneNumber,Password,EmailVerified',
		FilterExpression: "Email = :Email or PhoneNumber = :PhoneNumber",
		ExpressionAttributeValues: {
			":Email": email,
			":PhoneNumber": email,
		}
	};
	var result = await db.connectionDB().scan(params, async function(err,data){
        if(err){
            return err;
        }else{
			var returndata = data.Items;
			return returndata;
        }
	}).promise().then(async(val)=>{
		if(val.Items[0]){
			var shapass = val.Items[0].Password
			var emailadd = val.Items[0].Email
			var userId = val.Items[0].ID
			var name = val.Items[0].UserName
			var emailVerify = val.Items[0].EmailVerified
			var phone = val.Items[0].PhoneNumber
			var TermsAndCondition = val.Items[0].TermsAndCondition
			if(emailVerify == "true"){
				if(sha512(userparams.Password) === shapass){
					if(TermsAndCondition == "Yes"){
						var deviceparms = {
							"ID":userId,
							"DeviceID":userparams.DeviceID,
						}
					}else{
						var deviceparms = {
							"ID":userId,
							"DeviceID":userparams.DeviceID,
							"TermsAndCondition":userparams.TermsAndCondition
						}
					}
					User.config({tableName: 'Users'});
					var updatedata =   await User.update(deviceparms)
					var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
					const encryptedString = cryptr.encrypt(val.Items[0].ID)
					Token.config({tableName: 'UserToken'});
					let token = jwt.sign({ encryptedString}, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', { expiresIn: '1 day' });
					var userparams1 = {
						"UserID":val.Items[0].ID,
						"Token":token,
						"Created_date":date
					}
					var result = Token.create(userparams1)
					val.Items[0]['Token'] = token
					val.Items[0]['UserID'] = val.Items[0].ID
					var resultdata = val.Items[0]
					if(result){
						var returndata1 = common_service.success(200, messageconfig.Login,resultdata)
						return returndata1
					}else{
						var returndata1 = common_service.success(400, "Username and Password incorrect.",'')
						return returndata1
					}
				}else{
					var returndata1 = common_service.success(400, messageconfig.Invalidcredentials,'')
					return returndata1
				}
			}else{
				if(sha512(userparams.Password) != shapass){
					var returndata1 = common_service.success(400, messageconfig.Invalidcredentials,'')
					return returndata1
				}else{
					var otp = common_service.randomotp(6)
					let awsConfig = {
						accessKeyId: config.accessKeyId,
						secretAccessKey: config.secretAccessKey,
						region: config.region
					};
					messgaedata = messageconfig.OTP
                    smsMessage = messgaedata.replace(/otpnumber/gi, otp);
					let msg = {
						"message": smsMessage,
						"sender": "RecBook",
						"phoneNumber": "+"+config.countrycode+phone // phoneNumber along with country code
					  };
					  sendMsg(awsConfig, msg).then(data => {
						console.log("Message sent");
					  })
					  .catch(err => {
						console.log(err);
					  });
					var html = "<body style='background-color:#fff; margin: 0; padding: 0; box-sizing: border-box;'> <table align='center' border='0' cellpadding='0' cellspacing='0' style='border-collapse:collapse; width:100%; max-width:640px; background-color: #fff;border: 1px solid #000;' class='content'> <tbody> <tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 0px 50px;'> <tbody> <tr> <td style='padding: 1px;text-align: center;'> <img src='cid:logo' style='display:block;text-align: center;margin-bottom: 15px;margin: 0 auto;width: 150px;'/> </td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 0px 50px;'> <tbody> <tr> <td style='padding: 1px;'> </td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 15px 50px;'> <tbody> <tr> <td style='padding: 1px;'> <p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'>Hello, "+name+"</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'>Thank you for register at our application</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'> Please verify your OTP.Your OTP number is below.</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'> <b>"+otp+"</b></p></td></tr></tbody> </table> </td></tr></tbody> </table></body>"
					let sendResult= sendMail.sendDynamicMail(emailadd,"Email verify",html);
					if(sendResult){
						User.config({tableName: 'Users'});
						var usersparams = {
							"ID":userId,
							"OTP":otp
						}
						var updatedata =   await User.update(usersparams)
					}
					var returndata1 = common_service.success(400, messageconfig.EmailNotVerified,'')
					return returndata1
				}
			}
		}else{
			var returndata1 = common_service.success(400, messageconfig.Invalidcredentials,'')
			return returndata1
		}
		
    });
    return result
}

async function passwordchange(userparams){
	var email = userparams.Email
	var params = {
		TableName: "Users",
		ProjectionExpression: 'ID,Email,UserName',
		FilterExpression: "Email = :Email",
		ExpressionAttributeValues: {
			":Email": email,
		}
	};
	var result = await db.connectionDB().scan(params, async function(err,response){
        if(err){
           return err;
        }else{
			var returndata = response.Items;
			return returndata;
        }
	}).promise().then((val)=>{
		var email = val.Items[0]
		if(email){
			var emailadd = email.Email
			var UserID = email.ID
			var UserName = email.UserName
			var gen = rn.generator({
				min:  1111111111
				, max:  9999999999
				, integer: true
			})
			const random = gen()
			var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
			ForgotToken.config({tableName: 'ForgotPasswordToken'});
			var userparms = {
				"Email" : emailadd,
				"Forgot_Token":random,
				"UserID":UserID,
				"Created_date":date
			}
			var createdata = ForgotToken.create(userparms);
			if(createdata){
				
				var html = "<body style='background-color:#fff; margin: 0; padding: 0; box-sizing: border-box;'> <table align='center' border='0' cellpadding='0' cellspacing='0' style='border-collapse:collapse; width:100%; max-width:640px; background-color: #fff;border: 1px solid #000;' class='content'> <tbody> <tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 0px 50px;'> <tbody> <tr> <td style='padding: 1px;text-align: center;'> <img src='cid:logo' style='display:block;text-align: center;margin-bottom: 15px;margin: 0 auto;width: 150px;'/> </td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 0px 50px;'> <tbody> <tr> <td style='padding: 1px;'> <h3 style='margin: 0px;text-align: center;font-size: 25px;'>Forgot Password</h3> </td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 15px 50px;'> <tbody> <tr> <td style='padding: 1px;'> <p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'>Hello, "+UserName+"</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'>We received a request to reset your password for your Rec-Book Account.</p></td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding: 15px 50px 15px 50px'> <tbody> <tr> <td align='left' style='float: left; font-family: Montserrat, sans-serif;width: 100%;text-align: center;'> <a href='https://recbook1.herokuapp.com/login/forgotpassword/"+UserID+"/"+random+"' style='font-size: 16px;font-weight: 600;padding: 10px 15px;color:#fff;background-color: #989aa2;border: 1px solid #989aa2;box-shadow: none;cursor: pointer;text-decoration: none;'>Reset Password</a> </td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 0px 50px;'> <tbody> <tr> <td style='padding: 1px;'> <p style='margin: 0px;font-size: 20px;text-align: left;margin-bottom: 30px;'>If you did not reset your password,no futher action is required.</p></td></tr></tbody> </table> </td></tr></tbody> </table> </body>"
				let sendResult= sendMail.sendDynamicMail(emailadd,"Forgot Password",html);
				if(sendResult){
					var returnmaildata = common_service.success(200, messageconfig.ResetLink,userparms)
					return returnmaildata
				}
			}else{
				var returnmaildata = common_service.success(400, messageconfig.Invalid)
				return returnmaildata
			}
		}else{
			var returndata1 = common_service.success(400, messageconfig.EmailNotexists,'')
			return returndata1
		}
	});
    return result
}

async function resetuserPasseword(userparams){
	var userID = userparams.userid
	var token = userparams.token
	var newpassword = sha512(userparams.newpassword)
	var params = {
		TableName: "ForgotPasswordToken",
		FilterExpression: "UserID = :UserID OR Forgot_Token = :Forgot_token",
		ExpressionAttributeValues: {
			":UserID": userID,
			":Forgot_token": token,
		}
	};
	var result = await db.connectionDB().scan(params, async function(err,response){
        if(err){
           return err;
        }else{
			var returndata = response.Items;
			return returndata;
        }
	}).promise().then((val)=>{
		if(val.Items[0]){
			var alldata = val.Items[0];
			var userId = alldata.UserID
			var ForgotID = alldata.ID
			var date = alldata.Created_date
			var newdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
			User.config({tableName: 'Users'});
			var userparms = {
				"ID" : userId,
				"Passworddecrypt":userparams.newpassword,
				"Password":newpassword,
			}
			dt1 = new Date(newdate);
			dt2 = new Date(date);
			var diffminutes = common_service.diff_minutes(dt1, dt2);
			if(diffminutes <= 30){
				var createdata = User.update(userparms);
				if(createdata){
					ForgotToken.config({tableName: 'ForgotPasswordToken'});
					var delteparams = {
						"ID" : ForgotID
					}
					var deletdata = ForgotToken.destroy(delteparams);
					var returnmaildata = common_service.success(200, messageconfig.Invalid,createdata)
					return returnmaildata
				}else{
					var returnmaildata = common_service.success(400, messageconfig.Invalid,'')
					return returnmaildata
				}
			}else{
				ForgotToken.config({tableName: 'ForgotPasswordToken'});
				var delteparams = {
					"ID" : ForgotID
				}
				var deletdata = ForgotToken.destroy(delteparams);
				var error = common_service.success(400, messageconfig.Linkexperied,'')
				return error
			}
		}else{
			var error = common_service.success(400, messageconfig.Invalid,'')
			return error
		}
	});
    return result
}

async function logoutUser(userparams){
	var userID = userparams.ID
	var params = {
		TableName: "UserToken",
		FilterExpression: "UserID = :UserID",
		ExpressionAttributeValues: {
			":UserID": userID,
		}
	};
	var result = await db.connectionDB().scan(params, async function(err,response){
        if(err){
           return err;
        }else{
			var returndata = response.Items;
			return returndata;
        }
	}).promise().then(async (val)=>{
		if(val.Items[0]){
			userID = val.Items[0].TokenID
			Token.config({tableName: 'UserToken'});
			var deletedata =   await Token.destroy(userID);
			console.log(deletedata)
			if(deletedata == null){
				var tokendata = await common_service.success(200, messageconfig.Logout,'')
				return tokendata
			}else{
				return false
			}
		}else{
			var error = common_service.success(200,  messageconfig.Invalid,'')
			return error
		}
	});
    return result
}

async function emailverify(userparams){
	ID = userparams.ID
	OTP = userparams.OTP
	var params = {
		TableName: "Users",
		FilterExpression: "ID = :ID",
		ExpressionAttributeValues: {
			":ID": ID,
		}
	};
	var result = await db.connectionDB().scan(params, async function(err,response){
        if(err){
           return err;
        }else{
			var returndata = response.Items;
			return returndata;
        }
	}).promise().then(async (val)=>{
		var data = val.Items[0]
		if(data){
			otp = data.OTP
			var newdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
			date = data.Created_date
			dt1 = new Date(newdate);
			dt2 = new Date(date);

			var diffminutes = common_service.diff_minutes(dt1, dt2);
			if(OTP == otp){
				var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
				User.config({tableName: 'Users'});
				var usersparams = {
					"ID":ID,
					"EmailVerified":"true",
					"PhoneVerified":"true"
				}
				var updatedata =   await User.update(usersparams);
				UserID = updatedata.attrs.ID
				PhoneNumber = updatedata.attrs.PhoneNumber
				Email = updatedata.attrs.Email

				const encryptedString = cryptr.encrypt(UserID)
				let token = jwt.sign({ encryptedString}, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', { expiresIn: '1 day' });
				var userparams1 = {
					"UserID":UserID,
					"Token":token,
					"Created_date":date
				}
				Token.config({tableName: 'UserToken'});
				var result = await Token.create(userparams1)
				result.attrs.PhoneNumber = PhoneNumber
				result.attrs.Email = Email 
				var emaildata = await common_service.success(200, messageconfig.EmailVerified,result)
				return emaildata
			}else{
				var emaildata = await common_service.success(400, messageconfig.Otpworng,'')
				return emaildata
			}
		}
	})
	return result
}

async function otpresend(userparams){
	ID = userparams.ID
	console.log(userparams)
	var params = {
		TableName: "Users",
		FilterExpression: "ID = :ID",
		ExpressionAttributeValues: {
			":ID": ID,
		}
	};
	var result = await db.connectionDB().scan(params, async function(err,response){
        if(err){
           return err;
        }else{
			var returndata = response.Items;
			return returndata;
        }
	}).promise().then(async (val)=>{
		var data = val.Items[0]
		if(data){
			email = data.Email
			UserID = data.ID
			name = data.UserName
			phone = data.PhoneNumber
			User.config({tableName: 'Users'});
			var otp = common_service.randomotp(6)
			let awsConfig = {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
				region: config.region
			};
			messgaedata = messageconfig.OTP
            smsMessage = messgaedata.replace(/otpnumber/gi, otp);
			let msg = {
				"message": smsMessage,
				"sender": "RecBook",
				"phoneNumber": "+"+config.countrycode+phone // phoneNumber along with country code				
			  };
			  sendMsg(awsConfig, msg).then(data => {
				console.log("Message sent");
			  })
			  .catch(err => {
				console.log(err); 
			  });
			var html = "<body style='background-color:#fff; margin: 0; padding: 0; box-sizing: border-box;'> <table align='center' border='0' cellpadding='0' cellspacing='0' style='border-collapse:collapse; width:100%; max-width:640px; background-color: #fff;border: 1px solid #000;' class='content'> <tbody> <tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 0px 50px;'> <tbody> <tr> <td style='padding: 1px;text-align: center;'> <img src='cid:logo' style='display:block;text-align: center;margin-bottom: 15px;margin: 0 auto;width: 150px;'/> </td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 0px 50px;'> <tbody> <tr> <td style='padding: 1px;'> </td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 15px 50px;'> <tbody> <tr> <td style='padding: 1px;'> <p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'>Hello, "+name+"</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'>Thank you for register at our application</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'> Please verify your OTP.Your OTP number is below.</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'> <b>"+otp+"</b></p></td></tr></tbody> </table> </td></tr></tbody> </table></body>"
			let sendResult= sendMail.sendDynamicMail(email,"Resend Otp",html);
			if(sendResult){
				User.config({tableName: 'Users'});
				var usersparams = {
					"ID":UserID,
					"OTP":otp
				}
				var updatedata =   await User.update(usersparams);
				var returndata1 = common_service.success(200, messageconfig.ResendOTP,'')
				return returndata1
			}else{
				var returndata1 = common_service.success(400,  messageconfig.Invalid,'')
				return returndata1
			}
		}
	})
	return result
}