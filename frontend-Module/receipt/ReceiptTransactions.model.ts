var Joi = require('joi');
const ReceiptTransactionsdb = require('../../helper/dynamodb');

var ReceiptTransactions = ReceiptTransactionsdb.dynamo.define('ReceiptTransactions', {
		hashKey : 'ID',
	 
		schema : {
			ID : ReceiptTransactionsdb.dynamo.types.uuid(),
            ReceiptId :Joi.string(),
            Approved :Joi.string(),
            Confirmation :Joi.string(),
            Created_date :Joi.string(),
            CreditCard :Joi.string(),
            CreditCardNumber :Joi.string(),
            Employee :Joi.string(),
            Invoice :Joi.string(),
            PurchasedAmount :Joi.string(),
            Sequence :Joi.string(),
            TransactionId :Joi.string(),
            TransactionType :Joi.string()
		}
	});

	module.exports = ReceiptTransactions;