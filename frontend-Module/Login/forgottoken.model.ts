var Joi = require('joi');

const forgot = require('../../helper/dynamodb');

var ForgotPasswordToken = forgot.dynamo.define('ForgotPasswordToken', {
		hashKey : 'ID',
	 
		// add the timestamp attributes (updatedAt, createdAt)
		//timestamps : true,
	 
		schema : {
			ID : forgot.dynamo.types.uuid(),
			UserID   : Joi.string(),
			Email    : Joi.string(),
			Forgot_Token    : Joi.number(),
		 	Created_date: Joi.string(),
		}
	});

	module.exports = ForgotPasswordToken;