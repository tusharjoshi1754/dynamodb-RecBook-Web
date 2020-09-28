var Joi = require('joi');
const toknedb = require('../../helper/dynamodb');
var Token = toknedb.dynamo.define('UserToken', {
		hashKey : 'TokenID',
	 
		// add the timestamp attributes (updatedAt, createdAt)
		//timestamps : true,
	 
		schema : {
			TokenID : toknedb.dynamo.types.uuid(),
			UserID   : Joi.string(),
			Token    : Joi.string(),
		 	Created_date: Joi.string(),
		}
	});

	module.exports = Token;