const express = require('express');
const router = express.Router();
const receiptservice = require('./receipt.service')
var common_service = require('../../common_service')
const Receipt = require('./receipt.model.ts');
const upload = require('../../file-upload');

router.post('/add_receipt', addReceipt);
router.post('/add_paymentname', addPaymentname);
router.post('/get_recipet', getreceipt);
router.post('/get_recipet_by_id', getreceiptbyID);
router.put('/receipt_update',updateData);
router.delete('/delete_recipet/:id',deleteReceipt);
router.get('/get_payment_name', getPaymentName);
router.post('/add_pos_receipt', pos_add_receipt);
router.post('/app_scan_receipt', app_scan_receipt);
router.post('/send_email_attchment', Send_Email_Attchment);
router.post('/get_email_scan_receipt', get_email_scan_receipt);

module.exports = router;

async function addReceipt(req,res,next){
	receiptservice.add_receipt(req.body)
	.then(role => role ? res.send({status:200,message:role.message,result:role.list}) : res.status(400).send({ message: 'User creation failed'}))
	.catch(err => next(err));
}

async function getreceipt(req,res,next){
	receiptservice.get_receiptID(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Receipt Deletion failed'}))
	.catch(err => next(err));
}

async function getreceiptbyID(req,res,next){
	receiptservice.get_user_receipt(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Receipt Deletion failed'}))
	.catch(err => next(err));
}

async function updateData(req,res,next){
	receiptservice.update_receipt(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Receipt Updation failed'}))
	.catch(err => next(err));
}

async function deleteReceipt(req,res,next){
	receiptservice.del_receipt_data(req.params.id)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Receipt Deletion failed'}))
	.catch(err => next(err));
}
async function addPaymentname(req,res,next){
	receiptservice.addpaymentName(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Payment Type Added failed'}))
	.catch(err => next(err));
}

async function getPaymentName(req,res,next){
	receiptservice.getpaymentName()
	.then((role) =>
		role ? res.send({status:200,result:role})  : res.status(400).send({ message: 'Payment Type Get failed'})
	)
	.catch(err => next(err));
}

async function pos_add_receipt(req,res,next){
	receiptservice.addposReceipt(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Receipt Added failed'}))
	.catch(err => next(err));
}
async function app_scan_receipt(req,res,next){
	receiptservice.App_Receipt_scan(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Receipt Added failed'}))
	.catch(err => next(err));
}
async function Send_Email_Attchment(req,res,next){
	receiptservice.Email_attchment(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Failed Sending Attchment'}))
	.catch(err => next(err));
}
async function get_email_scan_receipt(req,res,next){
	receiptservice.Get_Email_scan_Receipt(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Receipt Added failed'}))
	.catch(err => next(err));
}