var Joi = require('joi');
const receiptdb = require('../../helper/dynamodb');

var Receipts = receiptdb.dynamo.define('Receipt', {
		hashKey : 'ID',
	 
		schema : {
			ID : receiptdb.dynamo.types.uuid(),
			BusinessId: Joi.string(),
			Receipt_ID   : Joi.string(),
			User_ID    : Joi.string(),
			User_Phone    : Joi.string(),
			User_Email    : Joi.string(),
			GSTIN : Joi.string(),
			Invoice : Joi.string(),
			Currency:Joi.string(),
			CustomerPhoneNumber : Joi.number(),
			CustomerName : Joi.string(),
			SubTotal: Joi.number(),
			TotalTax: Joi.number(),
			TotalAmount: Joi.number(),
			ConfirmationReceived: Joi.string(),
			ConfirmationSent: Joi.string(),
			ConfirmationURL: Joi.string(),
			CustomerConset: Joi.string(),
			FooterNote: Joi.string(),
			HeaderNote : Joi.string(),
			TranscationDateTime : Joi.string(),
			PaymentType:Joi.string(),
			OriginalData:Joi.string(),
			Type:Joi.string(),
			RecordStatus:Joi.string(),
			MonthName:Joi.string(),
			CreatedDateTime: Joi.string(),
		}
	});

	module.exports = Receipts;