var AWS = require('aws-sdk');
let awsConfig = {
    'region': 'us-east-1',
    'accessKeyId':'AKIASNCAKZGQFUCPU5ID','secretAccessKey':'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'
}
AWS.config.update(awsConfig);

module.exports = {
    connectionDB
}
function connectionDB () {
    var docClient = new AWS.DynamoDB.DocumentClient();
    return docClient;
}