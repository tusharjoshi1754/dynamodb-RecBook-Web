var Joi = require('joi');
const paymentdb = require('../../helper/dynamodb');

var PaymentType= paymentdb.dynamo.define('PaymentType', {
		hashKey : 'ID',
	 
		schema : {
			ID : paymentdb.dynamo.types.uuid(),
			PaymentName   : Joi.string(),
			Created_date: Joi.string(),
		}
	});

	module.exports = PaymentType;