var Joi = require('joi');

const dbdynamo = require('../../helper/dynamodb');

var User = dbdynamo.dynamo.define('Users', {
		hashKey : 'ID',
	 
		// add the timestamp attributes (updatedAt, createdAt)
		//timestamps : true,
	 
		schema : {
			ID : dbdynamo.dynamo.types.uuid(),
			FirstName   : Joi.string(),
			LastName    : Joi.string(),
			UserName     : Joi.string(),
			Email : Joi.string().email(),
			Authentication_Provider : Joi.string(),
			PhoneNumber: Joi.string(),
			Password: Joi.string(),
			Address: Joi.string(),
		 	Country: Joi.string(),
		 	State: Joi.string(),
		 	DeviceID:Joi.string(),
		 	City: Joi.string(),
		 	PostalCode: Joi.string(),
		 	Status: Joi.string(),
		 	Created_date: Joi.string(),
			Updated_date: Joi.string(),
		 
		}
	});

	module.exports = User;