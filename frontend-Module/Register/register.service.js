var uuid = require('uuid');
const db = require('../../helper/db');
const User = require('./register.model.ts');
const sha512 = require('js-sha512');
var common_service = require('../../common_service')
const dateFormat = require('dateformat');
var fs = require('fs'); 
var Token = require('../Login/token.model.ts')
const Country = require('../Country/Country.model.ts');
var jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
const sendMail = require('../../helper/email')
const config = require('../../config.json');
let sendMsg = require('aws-sns-sms');
let messageconfig = require("../../messageConfig.json")

module.exports = {
    add_user,
    get_user_data,
    //update_user,
    del_user_data,
    get_userID
}

async function add_user(userparms) {
    var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
    User.config({tableName: 'Users'});
    var username = userparms['UserName']
    //userparms['DeviceID'] = userparms.DeviceID
    console.log(userparms)
    var email = userparms.Email
    if(userparms['Password'] == "null"){
        userparms['Password'] = username
        //userparms['Passworddecrypt']=username
    }else{
       // userparms['Passworddecrypt'] = userparms['Password']
        userparms['Password'] = sha512(userparms['Password'])
    }
    userparms['Created_date'] = date
    userparms['Updated_date'] = date
   
    var Auth_prov = userparms['Authentication_Provider']
	var params = {
		TableName: "Users",
		FilterExpression: "Email = :Email",
		ExpressionAttributeValues: {
			":Email": email,
		}
	};
    var emailobj = await db.connectionDB().scan(params, async function(err,data){
        if(err){
            return err;
        }else{
            var returndata = data.Items;
			return returndata;
        }
	}).promise().then(async (val)=>{
        if(Auth_prov == "GOOGLE"){
            if(val.Items.length != 0){
                userEmail = val.Items[0].Email
                userId = val.Items[0].ID
                Authentication_Provider = val.Items[0].Authentication_Provider
                ProfileUrl = val.Items[0].ProfileUrl
                UserName = val.Items[0].UserName
                authToken = val.Items[0].authToken
                Password = val.Items[0].Password
                Created_date = val.Items[0].Created_date
                Updated_date = val.Items[0].Updated_date
                retundata = {
                    "UserName":UserName,
                    "Email":userEmail,
                    "Authentication_Provider":Authentication_Provider,
                    "Password":Password,
                    "ProfileUrl":ProfileUrl,
                    "UserID":userId,
                    "Created_date":Created_date,
                    "Updated_date":Updated_date,
                }
                    if(userparms.Email == userEmail){
                        var deviceparms = {
                            "ID":userId,
                            "DeviceID":userparms.DeviceID
                        }
                        var updatedata =   await User.update(deviceparms)
                        const encryptedString = cryptr.encrypt(userId)
                        let token = jwt.sign({ encryptedString}, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', { expiresIn: '1 day' });
                        Token.config({tableName: 'UserToken'});
                        var userparams1 = {
                            "UserID":userId,
                            "Token":token,
                            "Created_date":date
                        }
                        var result = await Token.create(userparams1)           
                        if(result){
                            retundata.Token = token
                            var returndata2 = await common_service.success(200, messageconfig.Login,retundata)
                            return returndata2
                        }else{
                            return false
                        }
                    }
                }else{
                    userparms['EmailVerified'] = "true"
                    var resultdata = await User.create(userparms)
                    if(resultdata){
                        var returndata1 = common_service.success(200, messageconfig.Register,resultdata)
                        var UserID = resultdata.attrs.ID
                        var Auth_provider = resultdata.attrs.Authentication_Provider
                        var deviceparms = {
                            "ID":UserID,
                            "DeviceID":userparms.DeviceID
                        }
                        var updatedata =   await User.update(deviceparms)
                        const encryptedString = cryptr.encrypt(UserID)
                        let token = jwt.sign({ encryptedString}, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', { expiresIn: '1 day' });
                        Token.config({tableName: 'UserToken'});
                        var userparams1 = {
                            "UserID":resultdata.attrs.ID,
                            "Token":token,
                            "Created_date":date
                        }
                        var result = await Token.create(userparams1)           
                        if(result){
                            resultdata.attrs.Token = token
                            resultdata.attrs.UserID = UserID
                            var returndata2 = await common_service.success(200, messageconfig.Login,resultdata)
                            return returndata2
                        }else{
                            return false
                        }
                        return returndata1
                    }else{
                        return false
                    }
                }
            }else{
                if(val.Items[0]){
                    userEmail = val.Items[0].Email
                    console.log(userparms.Email)
                    //console.log(email)
                    if(userEmail == userparms.Email){
                        var returnemail = common_service.error(400, messageconfig.EmailAlerdy)
                        return returnemail
                    }
                }
                else{ 
                    userparms['TermsAndCondition'] = userparms.TermsAndCondition
                    userparms['Country'] = userparms.Country
                    var resultdata = await User.create(userparms)
                    resultdata.attrs.UserID = resultdata.attrs.ID
                    if(resultdata){
                        var email = resultdata.attrs.Email
                        var name = resultdata.attrs.UserName
                        var userId = resultdata.attrs.ID
                        var otp = common_service.randomotp(6)
                        let awsConfig = { 
                            accessKeyId: config.accessKeyId,
                            secretAccessKey: config.secretAccessKey,
                            region: config.region
                        };
                        let msg = {
                            "message": "Please verify your rec-Book account, your OTP is "+otp+", this is valid for 10 min. only.",
                            "sender": "RecBook",
                            "phoneNumber": "+"+config.countrycode+userparms.PhoneNumber // phoneNumber along with country code
                          };
                          sendMsg(awsConfig, msg).then(data => {
                            console.log("Message sent");
                          })
                          .catch(err => {
                            console.log(err);
                          });
                          resultdata.attrs.SMSMessage = "Please verify your rec-Book account, your OTP is "+otp+", this is valid for 10 min. only."
                        var html = "<body style='background-color:#fff; margin: 0; padding: 0; box-sizing: border-box;'> <table align='center' border='0' cellpadding='0' cellspacing='0' style='border-collapse:collapse; width:100%; max-width:640px; background-color: #fff;border: 1px solid #000;' class='content'> <tbody> <tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 0px 50px;'> <tbody> <tr> <td style='padding: 1px;text-align: center;'> <img src='cid:logo' style='display:block;text-align: center;margin-bottom: 15px;margin: 0 auto;width: 150px;'/> </td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 0px 50px;'> <tbody> <tr> <td style='padding: 1px;'> </td></tr></tbody> </table> </td></tr><tr> <td> <table border='0' cellpadding='0' cellspacing='0' width='100%' style='padding:15px 50px 15px 50px;'> <tbody> <tr> <td style='padding: 1px;'> <p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'>Hello, "+name+"</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'>Thank you for register at our application</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'> Please verify your OTP.Your OTP number is below.</p><p style='margin: 0px;padding-top: 15px;font-size: 20px;text-align: left;'> <b>"+otp+"</b></p></td></tr></tbody> </table> </td></tr></tbody> </table></body>"
                        let sendResult= sendMail.sendDynamicMail(email,"Email verify",html);
                        if(sendResult){
                            User.config({tableName: 'Users'});
                            var usersparams = {
                                "ID":userId,
                                "OTP":otp
                            }
                            var updatedata =   await User.update(usersparams);
                        }
                        var returndata1 = common_service.success(200, messageconfig.Registeremail,resultdata)
                        return returndata1
                    }else{
                        return false
                    }
                }
		}
    });
    return emailobj
}

async function get_user_data(res) {
    var params = {
        TableName: "Users",
    };
    var result = await db.connectionDB().scan(params, function(err,data){
        if(err){
            return err;
        }else{
            var returndata = data.Items;
            console.log(returndata)
            return returndata
        }
    }).promise().then((val)=>{
        return val
    });
    return result
}

async function get_userID(id) {
    User.config({tableName: 'Users'});
    var result =   await User.get(id)
    var data = result.attrs
    County_data = ''
    countryid = result.attrs.Country
    if(countryid != undefined){
        Country.config({tableName: 'Country'});
        var CountryData =   await Country.get(countryid)
        if(CountryData){
            data.Country = CountryData.attrs.Country
            data.CountryID = CountryData.attrs.ID
        }
    }
    if(data){
        return data
    }else{
        return false
    }
}

// async function update_user(userparms) {
//     User.config({tableName: 'Users'});
//     var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
//     userparms['Updated_date'] = date
//     var updatedata =   await User.update(userparms);
//     if(updatedata){
//         return updatedata
//     }else{
//         return false
//     }
// }

async function del_user_data(id) {
    User.config({tableName: 'Users'});
    var deletedata =   await User.destroy(id);
    if(deletedata == null){
        return id
    }else{
        return false
    }
}
