   var  aws = require('aws-sdk'),
    multer = require('multer'),
    multerS3 = require('multer-s3'),
    s3config = require("./helper/s3config");
var upload = multer({
    storage: multerS3({
        s3: s3config.s3,
        bucket: 'rec-book-image',
        acl : 'public-read',
        ContentType:'image/png',
        key: function (req, file, cb) {
            console.log(file);
            var date = Date.now();
            cb(null, date+'_'+file.originalname); //use Date.now() for unique file keys
        }
    })
});

module.exports = upload