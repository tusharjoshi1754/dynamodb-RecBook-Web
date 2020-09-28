var Joi = require('joi');

const countrydb = require('../../helper/dynamodb');

var Country = countrydb.dynamo.define('Country', {
		hashKey : 'ID',
	 
		// add the timestamp attributes (updatedAt, createdAt)
		//timestamps : true,
	 
		schema : {
			ID : countrydb.dynamo.types.uuid(),
			Country   : Joi.string(),
            Currency    : Joi.string(),
            CreatedDateTime:Joi.string()
		}
	});

	module.exports = Country;