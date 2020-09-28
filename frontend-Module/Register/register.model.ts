var Joi = require('joi');
const db = require('../../helper/dynamodb');

var User = db.dynamo.define('Users', {
		hashKey : 'ID',
	 
		schema : {
			ID : db.dynamo.types.uuid(),
			FirstName   : Joi.string(),
			LastName    : Joi.string(),
			UserName     : Joi.string(),
			Email : Joi.string().email(),
			Authentication_Provider : Joi.string(),
			PhoneNumber: Joi.number(),
			Password: Joi.string(),
			Passworddecrypt: Joi.string(),
			Address: Joi.string(),
		 	Country: Joi.string(),
		 	State: Joi.string(),
		 	City: Joi.string(),
		 	PostalCode: Joi.string(),
			Status: Joi.string(),
			ProfileImage : Joi.string(),
			ProfileUrl : Joi.string(),
			OTP : Joi.number(),
			DeviceID:Joi.string(),
			EmailVerified : Joi.string(),
			PhoneVerified:Joi.string(),
			authToken: Joi.string(),
			TermsAndCondition:Joi.string(),
		 	Created_date: Joi.string(),
			Updated_date: Joi.string(),
		 
		}
	});

	module.exports = User;