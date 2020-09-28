const expressJwt = require('express-jwt');
const config = require('../config.json');



module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret }).unless({
        path: [
            // public routes that don't require authentication
            '/login/authenticate',
            '/user/add_user',
            '/user/get_user',
            '/login/forgotpasswordlinkgenerate',
            '/login/resetpassword',
            '/receipt/add_receipt',
            '/receipt/get_recipet',
            '/receipt/receipt_update',
            '/login/emailverify',
            '/login/resendOtp',
            '/receipt/add_paymentname',
            '/receipt/get_payment_name',
            '/receipt/email_scan_receipt',
            '/receipt/send_email_attchment',
            '/receipt/app_scan_receipt',
            '/receipt/add_pos_receipt',
            '/receipt/get_recipet_by_id',
            '/notification/smsnotification',
            '/receipt/get_email_scan_receipt',
            '/email-scan/email_scan_data',
            '/email-scan/Submit_email',
            '/email-scan/get_email_data',
            '/country/get_country',
            '/country/add_country',
            '/country/add_currecny',
            '/country/get_currecny',
        
        
            new RegExp('/user/get_userby_id.*/','i'),
            new RegExp('/login/forgotpassword.*/','i'),
            new RegExp('/receipt/delete_recipet.*/','i'),
        ]
    });
}