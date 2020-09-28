var Joi = require('joi');
const orderitemdb = require('../../helper/dynamodb');

var OrderItem= orderitemdb.dynamo.define('OrderItem', {
		hashKey : 'ID',
	 
		schema : {
			ID : orderitemdb.dynamo.types.uuid(),
			ReceiptID   : Joi.string(),
			ItemName    : Joi.string(),
			Price     : Joi.number(),
			Description     : Joi.string(),
			Quantity : Joi.string(),
			RecordStatus:Joi.string(),
			//Tax : Joi.number(),
			Created_date: Joi.string(),
		}
	});

	module.exports = OrderItem;