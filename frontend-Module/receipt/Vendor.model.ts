var Joi = require('joi');
const vendordb = require('../../helper/dynamodb');

var Vendor = vendordb.dynamo.define('Vendor', {
		hashKey : 'ID',
	 
		schema : {
			ID : vendordb.dynamo.types.uuid(),
            Address : Joi.string(),
            AuthenticateKey : Joi.string(),
            Created_date : Joi.string(),
			OrganizationName :Joi.string(),
			PhoneNumber:Joi.string(),
			Email:Joi.string()
		}
	});

	module.exports = Vendor;