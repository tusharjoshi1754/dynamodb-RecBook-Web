var Joi = require('joi');
const businessdb = require('../../helper/dynamodb');

var Businesses = businessdb.dynamo.define('Businesses', {
		hashKey : 'ID',
	 
		schema : {
			ID : businessdb.dynamo.types.uuid(),
			BusinessAddress   : Joi.string(),
			BusinessName    : Joi.string(),
			BusinessPhone     : Joi.number(),
			Businessddress : Joi.string(),
			RecordStatus:Joi.string(),
			GSTIN:Joi.string(),
			CreatedDateTIme : Joi.string(),
			Currency:Joi.string(),
			LastModifiedDateTime : Joi.string(),
			LastModifiedIPAddress : Joi.string(),
			TaxNumber : Joi.string(),
			TaxType : Joi.string(),
			webURL: Joi.string(),
		}
	});

	module.exports = Businesses;