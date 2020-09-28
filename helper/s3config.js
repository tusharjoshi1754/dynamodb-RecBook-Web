aws = require('aws-sdk'),
aws.config.update({
    secretAccessKey: 'BHwcv0KRgrgdJpvoFf0Rm7+nPydrhsuTNOj68eV0',
    accessKeyId: 'AKIASNCAKZGQFUCPU5ID',
    region: 'us-east-1'
});

var s3 = new aws.S3();

module.exports = {
    s3
}