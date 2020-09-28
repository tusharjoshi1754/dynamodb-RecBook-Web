var Joi = require('joi');
const customerreceipt = require('../../helper/dynamodb');

var CustomerReceipts = customerreceipt.dynamo.define('CustomerReceipts', {
		hashKey : 'ID',
	 
		schema : {
			ID : customerreceipt.dynamo.types.uuid(),
			ReceiptId   : Joi.string(),
			UserId    : Joi.string(),
			User_Phone    : Joi.string(),
			User_Email    : Joi.string(),
			RecordStatus:Joi.string(),
			MonthName:Joi.string(),
			CreatedDateTIme     : Joi.string(),
			ReceiptDate:Joi.string(),
			LastModifiedDateTime : Joi.string(),
		}
	});

	module.exports = CustomerReceipts;