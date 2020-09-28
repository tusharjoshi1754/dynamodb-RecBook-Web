var dynamo = require('dynamodb');
let awsConfig = {
    'region': 'us-east-1',
    'accessKeyId':'AKIASNCAKZGQFUCPU5ID','secretAccessKey':'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'
}
dynamo.AWS.config.update(awsConfig);
module.exports = {
    dynamo
}