var Joi = require('joi');

const currecnydb = require('../../helper/dynamodb');

var Currecny = currecnydb.dynamo.define('Currency', {
		hashKey : 'ID',
	 
		schema : {
			ID : currecnydb.dynamo.types.uuid(),
            Currency    : Joi.string(),
			CurrencySpecialChar: Joi.string(),
            CreatedDateTime:Joi.string()
		}
	});

	module.exports = Currecny;