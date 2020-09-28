const db = require('../../helper/db');
const Receipt = require('./receipt.model.ts');
const Businesses = require('./businesses.model.ts');
const CustomerReceipts = require('./customerreceipt.model.ts');
const PaymentType = require('./PaymentType.model.ts');
const ReceiptTransactions = require('./ReceiptTransactions.model.ts');
const Vendor = require('./Vendor.model.ts');
const OrderItem = require('./orderitem.model.ts');
const Country = require('../Country/Country.model.ts');
const Currency = require('../Country/Currency.model.ts');
var common_service = require('../../common_service')
const dateFormat = require('dateformat');
var _ = require('lodash');
var moment = require('moment')
const { uuid } = require('uuidv4');
const nodemailer = require('nodemailer');
var pdf = require('html-pdf');
var fs = require('fs');
var csv = require('to-csv');
const OneSignal = require('onesignal-node');
let messageconfig = require("../../messageConfig.json")
var {google} = require('googleapis');
const simpleParser = require('mailparser').simpleParser;
const User = require('../Register/register.model.ts');

module.exports = {
	add_receipt,
	get_receiptID,
	get_user_receipt,
	update_receipt,
	del_receipt_data,
	addpaymentName,
	getpaymentName,
	addposReceipt,
	App_Receipt_scan,
	Email_attchment,
	Get_Email_scan_Receipt
}

async function add_receipt(userparms) {
	var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
	totaltax = userparms.TotalTax
	var businessparams = {
		"BusinessName": userparms.BusinessName,
		"BusinessAddress":userparms.BusinessAddress,
		"BusinessPhone":userparms.BusinessPhonenumber,
		"TaxNumber":userparms.TaxNumber,
		"RecordStatus":"1",
		"CreatedDateTIme":date
	}
	Businesses.config({tableName: 'Businesses'});
	var businessresult =  await Businesses.create(businessparams)
	lastbussinsertID = businessresult.attrs.ID
	if(totaltax == 0){
		var receipparmas = {
			"Receipt_ID": userparms.Receipt_ID,
			"BusinessId": lastbussinsertID,
			"User_ID": userparms.User_ID,
			"User_Phone":userparms.User_Phone,
			"User_Email":userparms.User_Email,
			"CustomerPhoneNumber": userparms.CustomerPhoneNumber,
			"CustomerName": userparms.CustomerName,
			"TotalAmount": userparms.TotalAmount,
			"SubTotal": userparms.SubTotal,
			"PaymentType":userparms.PaymenttypeID,
			"RecordStatus":"1",
			"Currency":userparms.Currency,
			"CreatedDateTime":userparms.Created_date
		}
	}else{
		var receipparmas = {
			"Receipt_ID": userparms.Receipt_ID,
			"BusinessId": lastbussinsertID,
			"User_ID": userparms.User_ID,
			"User_Phone":userparms.User_Phone,
			"User_Email":userparms.User_Email,
			"CustomerPhoneNumber": userparms.CustomerPhoneNumber,
			"CustomerName": userparms.CustomerName,
			"TotalAmount": userparms.TotalAmount,
			"TotalTax": totaltax,
			"SubTotal": userparms.SubTotal,
			"PaymentType":userparms.PaymenttypeID,
			"RecordStatus":"1",
			"Currency":userparms.Currency,
			"CreatedDateTime":date
		}
	}
	
	Receipt.config({tableName: 'Receipt'});
	var result =  await Receipt.create(receipparmas)
	if(result){
		var returndata1 = await common_service.success(200, messageconfig.AddReceipt,result)
		var OrderItems = userparms.OrderItems
		var lastInsertID = result.attrs.ID
		OrderItems.forEach(async(element) => {
			var desc = element.Description
			if(desc == undefined){
				var orderItemparmas = {
					"ReceiptID":lastInsertID,
					"ItemName":element.ItemName,
					"Price":element.Price,
					"Quantity":element.Quantity,
					"RecordStatus":"1",
					"Created_date":date
				}
			}else{
				var orderItemparmas = {
					"ReceiptID":lastInsertID,
					"ItemName":element.ItemName,
					"Price":element.Price,
					"Quantity":element.Quantity,
					"Description":desc,
					"RecordStatus":"1",
					"Created_date":date
				}
			}
			OrderItem.config({tableName: 'OrderItem'});
			var orderitemresult = await OrderItem.create(orderItemparmas)
			if(orderitemresult){
				var returnorderitem = await common_service.success(200, messageconfig.AddReceipt,orderitemresult)
				return returnorderitem
			}else{
				return false
			}
		});
		var MonthName = dateFormat(userparms.Created_date, "mmmm" )
		var receiptDate = dateFormat(new Date(), "yyyy-mm-dd" )
		var customerreceiptparms = {
			"UserId":userparms.User_ID,
			"User_Phone":userparms.User_Phone,
			"User_Email":userparms.User_Email,
			"ReceiptId":lastInsertID,
			"RecordStatus":"1",
			"MonthName":MonthName,
			"CreatedDateTIme":userparms.Created_date,
			"ReceiptDate":receiptDate
		}
		CustomerReceipts.config({tableName: 'CustomerReceipts'});
		var orderitemresult = await CustomerReceipts.create(customerreceiptparms)
		return returndata1
	}else{
	    return false
	}
}

async function get_receiptID(userparms){
	var UserPhone = userparms.UserPhone
	var params ={
	TableName: "CustomerReceipts",
		FilterExpression: "User_Email = :User_Email or User_Phone = :User_Phone",
		ExpressionAttributeValues: {
			":User_Email": UserPhone,
			":User_Phone": UserPhone,
		}
	}
	console.log(params)
	var tmp = []
	var result = await db.connectionDB().scan(params, async function(err,response){
		if(err){
			return err;
        }else{
			var custmerreceipt = response.Items;
		    return custmerreceipt;
        }
	}).promise().then(async(val)=>{
		var result = val.Items;
		var SortarryResult = _.orderBy(result,'CreatedDateTIme','desc');
		return SortarryResult
	})
	let res = {}
	var receiptdata = result
	var receiptarr =[]
	if(receiptdata){
		for(let i=0 ;i < receiptdata.length ; i++){
			var tmparr = []
			var receiptid = receiptdata[i].ReceiptId
			var CustomerreceiptID = receiptdata[i].ID
			var Receiptdate = receiptdata[i].CreatedDateTIme
			var RecordStatus = receiptdata[i].RecordStatus
			var MonthName = receiptdata[i].MonthName
		
			if(RecordStatus == "1"){
				Receipt.config({tableName: 'Receipt'});
				var receipparmas = {
					"ID":receiptid
				}
				var receiptresult =  await Receipt.get(receipparmas)
				var date = receiptresult.attrs.CreatedDateTime
				receiptresult.attrs["Receiptdate"] = Receiptdate
				receiptresult.attrs["CustomerReceiptID"] = CustomerreceiptID
				receiptresult.attrs["MonthName"] = MonthName
				var paymentTypeID = receiptresult.attrs.PaymentType
				var CurrencyID = receiptresult.attrs.Currency
				if(CurrencyID){
					Currency.config({tableName: 'Currency'});
					var Currencyparmas = {
						"ID":CurrencyID
					}
					var CurrencyResult =  await Currency.get(Currencyparmas)
					if(CurrencyResult){
						receiptresult.attrs['Currency'] = CurrencyResult.attrs.Currency
						receiptresult.attrs['CurrencySymbol'] = CurrencyResult.attrs.CurrencySpecialChar
					}
				}
				if(paymentTypeID){
					PaymentType.config({tableName: 'PaymentType'});
					var PaymentTypeparmas = {
						"ID":paymentTypeID
					}
					var paymentyperesult =  await PaymentType.get(PaymentTypeparmas)
					if(paymentyperesult){
						var PaymentName = paymentyperesult.attrs.PaymentName
						receiptresult.attrs['PaymentName'] = PaymentName
					}else{
						receiptresult.attrs['PaymentName'] = paymentTypeID
					}
				}
				var businessID = receiptresult.attrs.BusinessId
				if(businessID){
					Businesses.config({tableName: 'Businesses'});
					var businessparmas = {
						"ID":businessID
					}
					var businessresult =  await Businesses.get(businessparmas)
					if(businessresult){
						var BusinessName = businessresult.attrs.BusinessName
						var BusinessAddress = businessresult.attrs.BusinessAddress
						var BusinessPhone = businessresult.attrs.BusinessPhone
						receiptresult.attrs['BusinessName'] = BusinessName
						receiptresult.attrs['BusinessAddress'] = BusinessAddress
						receiptresult.attrs['BusinessPhone'] = BusinessPhone
					}
				}
				receiptarr.push(receiptresult)
			}
		}
		Receiptdata = receiptarr.reduce(function (val, item) {
			var receiptdata = item.attrs.Receiptdate.split(('-'))[1];
			(val[receiptdata]) ? val[receiptdata].data.push(item) : val[receiptdata] = {MonthName: item.attrs.MonthName, data: [item]};
			return val;
		}, {});
		
		var finalresult = _.keys(Receiptdata).map(function(k){ return Receiptdata[k]; });
		var returnorderitem = await common_service.success(200, messageconfig.ListingReceipt,finalresult)
		return returnorderitem
	}else{
		var returnorderitem = await common_service.success(400, messageconfig.ReceiptNot,'')
		return returnorderitem
	}
}

async function get_user_receipt(userparms){
	id = userparms.ID
	var html = null
	userEmail = userparms.UserEmail
	AttchemntType = userparms.AttchemntType
	var params = {
		"ID":id
	}
	console.log(params)
	CurrencyData = ''
	CustomerReceipts.config({tableName: 'CustomerReceipts'});
	var customerreceiresult = await CustomerReceipts.get(params)
	if(customerreceiresult){
		receiptID = customerreceiresult.attrs.ReceiptId
		CreatedDateTIme = customerreceiresult.attrs.CreatedDateTIme
		CustomerReceiptID = customerreceiresult.attrs.ID
		Receipt.config({tableName: 'Receipt'});
		var receiptparams={
			"ID":receiptID,
		}
		var result =   await Receipt.get(receiptparams)
		if(result){
			var receiptdata = result.attrs
			CustomerName = result.attrs.CustomerName
			CustomerPhoneNumber = result.attrs.CustomerPhoneNumber
			BilNo = result.attrs.Receipt_ID
			SubTotal = result.attrs.SubTotal
			TotalAmount = result.attrs.TotalAmount
			var CurrencyID = result.attrs.Currency
			if(CurrencyID){
				Currency.config({tableName: 'Currency'});
				var Currecnyparmas = {
					"ID":CurrencyID
				}
				var CurrencyResult =  await Currency.get(Currecnyparmas)
				if(CurrencyResult){
					CurrencyData = CurrencyResult 
				}
			}
			var paymenttypeID = receiptdata.PaymentType
			if(paymenttypeID){
				var paymentTypeparmas = {
					"ID":paymenttypeID
				}
				PaymentType.config({tableName: 'PaymentType'});
				var Paymenttyperesult =   await PaymentType.get(paymentTypeparmas)
				if(Paymenttyperesult){
					PaymentName = Paymenttyperesult.attrs.PaymentName
				}
			}
			receiptdata['ReceiptDate'] = CreatedDateTIme
			receiptdata['CustomerReceiptID'] = CustomerReceiptID
			var receiptID = result.attrs.ID
			var bussinessID = result.attrs.BusinessId
			Businesses.config({tableName: 'Businesses'});
			var bussinesparams = {
				"ID":bussinessID 
			}
			var bussinesresult =   await Businesses.get(bussinesparams)
			if(bussinesresult){
				TaxNumber =bussinesresult.attrs.TaxNumber
				BusinessName =bussinesresult.attrs.BusinessName
				BusinessPhone =bussinesresult.attrs.BusinessPhone
				BusinessAddress =bussinesresult.attrs.BusinessAddress
			}
			var params = {
				TableName: "ReceiptTransactions",
				FilterExpression: "ReceiptId = :ReceiptId",
				ExpressionAttributeValues: {
					":ReceiptId": receiptID,
				},
			};
			var transcationrecipt = await db.connectionDB().scan(params, async function(err,response){
				if(err){
					return err;
				}else{
					var ReceiptTransactions = response.Items;
					return ReceiptTransactions;
				}
			}).promise().then(async(val)=>{
				var result1 = val.Items;
				return result1
			})
			console.log(transcationrecipt)
			if(transcationrecipt != ''){
				CreditCard = transcationrecipt[0].CreditCard
				CreditCardNumber = transcationrecipt[0].CreditCardNumber
				TransactionType = transcationrecipt[0].TransactionType
			}else{
				CreditCard = ''
				CreditCardNumber = ''
				TransactionType = ''
			}
		}
		var params = {
			TableName: "OrderItem",
			FilterExpression: "ReceiptID = :ReceiptID",
			ExpressionAttributeValues: {
				":ReceiptID": receiptID,
			}
		};
		var result = await db.connectionDB().scan(params, async function(err,response){
			if(err){
				return err;
			}else{
				var returndata = response.Items;
				return returndata;
			}
		}).promise().then((val)=>{
			var OrderData = val.Items
			
			if(AttchemntType == "PDF"){
				var html1 = "<html><body style='font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;'> <table style='max-width:600px; margin:0 auto; background-color:#fff; padding:20px; border: 1px solid #eee'> <thead><tr><th style='font-size:20px;text-align:center;font-weight:700;width: 100%;margin: 0 auto;'>"+BusinessName+"</th></tr></thead> <tbody><tr><td colspan='2'><p style='padding: 10px 0px;font-size:14px;text-align: left; border-top: 1px dotted #eee; border-bottom: 1px dotted #eee;'>"+BusinessAddress+"</p></td></tr><tr><td style='width:50%;padding-top:20px;vertical-align:top;border-bottom: 1px dotted #eee;padding-bottom: 5px;'> <p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px'>TaxNumber :</span> "+TaxNumber+"</p><p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px;'>Tel :</span> "+BusinessPhone+"</p><p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px;'>Bill No :</span> "+BilNo+"</p></td></tr><tr><td style='width:50%;padding-top:20px;vertical-align:top;border-bottom: 1px dotted #eee;padding-bottom: 5px;'> <p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px'>Date :</span> "+CreatedDateTIme+"</p><p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px;'>Name :</span> "+CustomerName+"</p><p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px;'>Mobile No :</span> "+CustomerPhoneNumber+"</p><p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px;'>Payment Name :</span> "+PaymentName+"</p></td></tr><tr><td style='width:50%;padding-top:20px;vertical-align:top;border-bottom: 1px dotted #eee;padding-bottom: 5px;'> <p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px'>CreditCard :</span> "+CreditCard+"</p><p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px;'>CreditCard Number :</span> "+CreditCardNumber+"</p><p style='margin:0 0 10px 0;padding:0;font-size:12px;'><span style='font-weight:bold;font-size:14px;'>TransactionType :</span> "+TransactionType+"</p></td></tr><tr style='text-align: left;display: block;border-bottom: 1px dotted #eee; padding: 5px 0px;'><th style='width: 100px;font-size: 14px;line-height: 26px;'>ItemName</th><th style='width:200px; font-size: 14px;line-height: 26px;'>Price</th><th style='width: 100px; font-size: 14px; line-height: 26px;'>Qty</th><th style='width:100px; font-size: 14px;line-height: 26px;'>Description</th> </tr>"
				for(i =0;i<OrderData.length;i++){
					if(OrderData){
						ItemName = OrderData[i].ItemName
						Price = OrderData[i].Price
						Description = OrderData[i].Description
						Quantity = OrderData[i].Quantity
						var html = "<tr style='text-align: left;display:block; padding: 3px 0px;'><td style='width:100px;'>"+ItemName+"</td><td style='width:200px;'>"+Price+"</td><td style='width:100px;'>"+Quantity+"</td><td style='width:100px;'>"+Description+"</td></tr>"
						html1 += html
					}
				}
				var html2 =html1+"<tr style='text-align: right;display: block; padding: 3px 0px;font-size: 14px;'><td colspan='2' style='text-align:right; padding:10px 10px 0px 10px;display: inline-block;'> <strong>Sub Total : </strong> "+SubTotal+" </td></tr><tr style='text-align: right;display: block;font-size: 14px;'><td colspan='2' style='text-align:right; padding:10px 10px 0px 10px;display: inline-block;'> <strong>Tax : </strong> "+SubTotal+" </td></tr><tr style='text-align: right;display: block; border-bottom: 1px dotted #eee; padding: 3px 0px;font-size: 14px;'> <td colspan='2' style='text-align:right; padding:10px;display: inline-block;'> <strong>TotalAmount : </strong> "+TotalAmount+" </td></tr></tbody> <tfooter><tr><td style='width:50%;padding:20px;vertical-align:top'> <p style='margin:0 0 10px 0;padding:0;font-size:14px;text-align: center;'>!! Thank you visit again !!</p></td></tr></tfooter> </table></body></html>"
				var options = { format: 'A4' };
				console.log(html2)
				pdf.create(html2,options).toFile(__dirname +'/Pdf/ReceiptData.pdf', function(err, res) {
					if (err) return console.log(err);
					console.log(res); // { filename: '/app/businesscard.pdf' }
				});
				var mail = nodemailer.createTransport({
				host: "mail.3iinfo.com",
				port: 465,
				secure: true, // true for 465, false for other ports
				auth: {
					user: "developer@3iinfo.com", // generated ethereal user
					pass:  "311nf0C0m"
				},
				tls: {
					rejectUnauthorized: false
					}
				});
				var mailOptions = {
					from: 'developer@3iinfo.com',
					to: userEmail,
					subject: 'ReceiptDetailPdf',
					html: '<h3>Hello</h3><p>Please see attchment</p>' ,
					attachments: [{
						filename: 'ReceiptDetail.pdf',
						path: __dirname + '/Pdf/ReceiptData.pdf',
						contentType: 'application/pdf'
					}]
				}	
				mail.sendMail(mailOptions, function(error, info){
					console.log("123")
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
						fs.unlinkSync(__dirname + '/Pdf/ReceiptData.pdf');
						console.log('File deleted!');
					}
				});
				var returnreceiptdata = common_service.success(200, messageconfig.PDF,'')
				return returnreceiptdata
			}
			var receiptdat = receiptdata
			var result = {
				'Receiptdata' :receiptdata,
				"Businessdata":bussinesresult,
				"PaymentType":Paymenttyperesult,
				'OrderItems':OrderData,
				"Currency":CurrencyData
			}
			if(AttchemntType != "PDF"){
				var returnreceiptdata = common_service.success(200, messageconfig.ReceiptGet,result)
				return returnreceiptdata
			}
		})
	}
   return result
}


async function update_receipt(userparms){
	var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
	totaltax = userparms.TotalTax
	var businessparams = {
		"ID":userparms.BusinessID,
		"BusinessName": userparms.BusinessName,
		"BusinessAddress":userparms.BusinessAddress,
		"BusinessPhone":userparms.BusinessPhonenumber,
		"TaxNumber":userparms.TaxNumber,
		"LastModifiedDateTime":date
	}
	Businesses.config({tableName: 'Businesses'});
	var businessresult =  await Businesses.update(businessparams)
	lastbussinsertID = businessresult.attrs.ID
	
	Receipt.config({tableName: 'Receipt'});
	if(totaltax == 0){
		var receipparmas = {
			"ID":userparms.ID,
			"Receipt_ID": userparms.Receipt_ID,
			"BusinessId": lastbussinsertID,
			"User_ID": userparms.User_ID,
			"CustomerPhoneNumber": userparms.CustomerPhoneNumber,
			"CustomerName": userparms.CustomerName,
			"TotalAmount": userparms.TotalAmount,
			"SubTotal": userparms.SubTotal,
			"PaymentType":userparms.PaymenttypeID,
			"Currency":userparms.Currency,
			"CreatedDateTime":userparms.Created_date
		}
	}else{
		var receipparmas = {
			"ID":userparms.ID,
			"Receipt_ID": userparms.Receipt_ID,
			"BusinessId": lastbussinsertID,
			"User_ID": userparms.User_ID,
			"CustomerPhoneNumber": userparms.CustomerPhoneNumber,
			"CustomerName": userparms.CustomerName,
			"TotalAmount": userparms.TotalAmount,
			"TotalTax": totaltax,
			"SubTotal": userparms.SubTotal,
			"PaymentType":userparms.PaymenttypeID,
			"Currency":userparms.Currency,
			"CreatedDateTime":userparms.Created_date
		}
	}
	console.log(totaltax)
    var updatedata =   await Receipt.update(receipparmas);
    if(updatedata){
		var returnreceiptdata = await common_service.success(200,  messageconfig.UpdateReceipt,updatedata)
		var receiptID = updatedata.attrs.ID
		var params = {
			TableName: "OrderItem",
			FilterExpression: "ReceiptID = :ReceiptID",
			ExpressionAttributeValues: {
				":ReceiptID": receiptID,
			}
		};
		var result = await db.connectionDB().scan(params, async function(err,response){
			if(err){
			   return err;
			}else{
				var returndata = response.Items;
			   return returndata;
			}
		}).promise().then(async(val)=>{
			OrderIDs = val.Items
			var OrderItems = userparms.OrderItems
			OrderIDs.forEach(async(value)=>{
				ItemID = value.ID
				var params ={
					"ID" : ItemID
				}
				OrderItem.config({tableName: 'OrderItem'});
				var deletedata =   await OrderItem.destroy(ItemID);
				if(deletedata){
					var returnorderdata = common_service.success(200, messageconfig.DeleteReceipt,deletedata)
					return returnorderdata
				}
			})
			OrderItems.forEach(async (element)=>{
				var desc = element.Description
				if(desc == undefined){
					var orderItemparmas = {
						"ReceiptID":receiptID,
						"ItemName":element.ItemName,
						"Price":element.Price,
						"Quantity":element.Quantity,
						"Created_date":date
					}
				}else{
					var orderItemparmas = {
						"ReceiptID":receiptID,
						"ItemName":element.ItemName,
						"Price":element.Price,
						"Quantity":element.Quantity,
						"Description":desc,
						//"Tax":tax,
						"Created_date":date
					}
				}
				
				OrderItem.config({tableName: 'OrderItem'});
				var updatedata1 =   await OrderItem.create(orderItemparmas);
				if(updatedata1){
					var returnorderdata = common_service.success(200,  messageconfig.UpdateReceipt,updatedata1)
					return returnorderdata
				}
			})
			var MonthName = dateFormat(userparms.Created_date, "mmmm" )
			var receiptDate = dateFormat(new Date(), "yyyy-mm-dd" )
			var customerreceiptparms = {
				"ID":userparms.CustomerReceiptID,
				"UserId":userparms.User_ID,
				"ReceiptId":userparms.ID,
				"RecordStatus":"1",
				"MonthName":MonthName,
				"CreatedDateTIme":userparms.Created_date,
				"ReceiptDate":receiptDate
			}
			CustomerReceipts.config({tableName: 'CustomerReceipts'});
			var orderitemresult = await CustomerReceipts.update(customerreceiptparms)
		})
		return returnreceiptdata
    }else{
        return false
	}
}

async function del_receipt_data(id){
	CustomerReceipts.config({tableName: 'CustomerReceipts'});
	var customerreceiptparams = {
		"ID" : id,
		"RecordStatus":"2"
	}
	var deletedata =   await CustomerReceipts.update(customerreceiptparams);
	var receiptID = deletedata.attrs.ReceiptId
    if(deletedata){
		var params = {
			TableName: "OrderItem",
			FilterExpression: "ReceiptID = :ReceiptID",
			ExpressionAttributeValues: {
				":ReceiptID": receiptID,
			}
		};
		var result = await db.connectionDB().scan(params, async function(err,response){
			if(err){
				return err;
			}else{
				var returndata = response.Items;
			   return returndata;
			}
		}).promise().then(async(val)=>{
			var orderItemID = val.Items
			orderItemID.forEach(async(element) => {
				orderID = element.ID
				var orderParams ={
					"ID":orderID,
					"RecordStatus":"2"
				}
				OrderItem.config({tableName: 'OrderItem'});
				var deletedata =   await OrderItem.update(orderParams);
				if(deletedata){
					var returnorderdata = common_service.success(200, messageconfig.DeleteReceipt,deletedata)
					return returnorderdata
				}
			})
		})
		Receipt.config({tableName: 'Receipt'});
		var receiptParams = {
			"ID" : receiptID,
			"RecordStatus":"2"
		}
		var receiptdeletedata =   await Receipt.update(receiptParams);
		if(receiptdeletedata){
			var bussinessID = receiptdeletedata.attrs.BusinessId
			Businesses.config({tableName: 'Businesses'});
			var buinessParams = {
				"ID" : receiptID,
				"RecordStatus":"2"
			}
			var buinessdeletedata =   await Businesses.update(buinessParams);
		}
		var returnorderdata = common_service.success(200, messageconfig.DeleteReceipt,receiptdeletedata)
		return returnorderdata
    }else{
        var returnorderdata = common_service.success(400, messageconfig.Invalid,'')
		return returnorderdata
    }
}


async function addpaymentName(userparms){
    PaymentType.config({tableName: 'PaymentType'});
    var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
    userparms['Created_date'] = date
    var paymentdata =   await PaymentType.create(userparms);
    if(paymentdata){
        var returnpaymentnamedata = common_service.success(200, "PaymentName Added sucessfully.",paymentdata)
		return returnpaymentnamedata
    }else{
        return false
    }
}

async function getpaymentName(){
	var params = {
		TableName: "PaymentType",
	};
	var result = await db.connectionDB().scan(params, async function(err,response){
		if(err){
			return err;
		}else{
			var returndata = response.Items;
			return returndata
		}
	}).promise().then(async(val)=>{
		var data = val.Items
		return data
	})
	return result
}

async function addposReceipt(userparms){
	var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
	AuthenticateKey = userparms.AuthenticateKey
	PhoneNumber = userparms.VendorPhoneNumber
	var transcationreceipt = userparms.TransactionRecord
	var params = {
		TableName: "Vendor",
		FilterExpression: "AuthenticateKey = :AuthenticateKey",
		ExpressionAttributeValues: {
			":AuthenticateKey": AuthenticateKey,
		}
	};
	var result = await db.connectionDB().scan(params, async function(err,response){
		if(err){
			return err;
		}else{
			var returndata = response.Items;
			return returndata;
		}
	}).promise().then((val)=>{
		return val
	})
	VendorData = result.Items[0]
	if(VendorData){
		authenticatekey = VendorData.AuthenticateKey
		if(authenticatekey == AuthenticateKey){
			OrganizationName = VendorData.OrganizationName
			CurrencyID = VendorData.Currency
			phonenumber = VendorData.PhoneNumber
			Email = VendorData.Email
			totaltax = userparms.TotalTax.Tax
			if(transcationreceipt != undefined){
				transcationDatetime = transcationreceipt.TransactionDateTime
			}else{
				transcationDatetime = "null"
			}
			var receipparmas = {
				"User_Email": Email,
				"User_Phone":phonenumber,
				"Receipt_ID": userparms.Id,
				"Currency":CurrencyID,
				"CustomerConset":userparms.CustomerConsent.toString(),
				"CustomerPhoneNumber": parseInt(userparms.CustomerPhoneNumber),
				"SubTotal": parseFloat(userparms.SubTotal),
				"TotalAmount": parseFloat(userparms.Total),
				"TotalTax": parseFloat(totaltax),
				"FooterNote":userparms.FooterNotes[0],
				"TranscationDateTime":transcationDatetime,
				"PaymentType":userparms.PaymentType,
				"RecordStatus":"1",
				"CreatedDateTime":date
			}
			console.log(receipparmas)
			Receipt.config({tableName: 'Receipt'});
			var receiptdata =  await Receipt.create(receipparmas)
			if(receiptdata){
				var returndata1 = await common_service.success(200, "Add receipt data Successfully",receiptdata)
				var OrderItems = userparms.OrderItems
				var lastInsertID = receiptdata.attrs.ID
				OrderItems.forEach(async(element) => {
					var desc = element.Description
					if(desc == undefined){
						var orderItemparmas = {
							"ReceiptID":lastInsertID,
							"ItemName":element.ItemName,
							"Price":parseFloat(element.Price),
							"Quantity":element.Quantity,
							"RecordStatus":"1",
							"Created_date":date
						}
					}else{
						var orderItemparmas = {
							"ReceiptID":lastInsertID,
							"ItemName":element.ItemName,
							"Price":parseFloat(element.Price),
							"Quantity":element.Quantity,
							"Description":desc,
							"RecordStatus":"1",
							"Created_date":date
						}
					}
					OrderItem.config({tableName: 'OrderItem'});
					var orderitemresult = await OrderItem.create(orderItemparmas)
					if(orderitemresult){
						var returnorderitem = await common_service.success(200, messageconfig.AddReceipt,orderitemresult)
						return returnorderitem
					}else{
						return false
					}
				});
				var MonthName = dateFormat(userparms.Created_date, "mmmm" )
				var customerreceiptparms = {
					"User_Email":Email,
					"User_Phone":phonenumber,
					"ReceiptId":lastInsertID,
					"RecordStatus":"1",
					"MonthName":MonthName,
					"CreatedDateTIme":userparms.Created_date,
				}
				CustomerReceipts.config({tableName: 'CustomerReceipts'});
				var customerreceipt = await CustomerReceipts.create(customerreceiptparms)
				if(transcationreceipt != undefined){
					var Transactionsparmas = {
						"ReceiptId":lastInsertID,
						"Approved":transcationreceipt.Approved.toString(),
						"Confirmation":transcationreceipt.Confirmation,
						"CreditCard":transcationreceipt.CreditCard,
						"CreditCardNumber":transcationreceipt.CreditCardNumber,
						"Employee":transcationreceipt.Employee,
						"Invoice":transcationreceipt.Invoice,
						"PurchasedAmount":transcationreceipt.Purchase,
						"Sequence":transcationreceipt.Sequence,
						"TransactionId":transcationreceipt.TransactionId,
						"TransactionType":transcationreceipt.TransactionType,
						"Created_date":date
					}
					ReceiptTransactions.config({tableName: 'ReceiptTransactions'});
					var transcationdata = await ReceiptTransactions.create(Transactionsparmas)
				}
				var result1 = {
					'Receiptdata' :receiptdata,
					"TranscationData":transcationdata,
					'OrderItems':OrderItems
				}
				if(result1){
					var Userparams ={
						TableName: "Users",
						FilterExpression: "Email = :Email or PhoneNumber = :PhoneNumber",
						ExpressionAttributeValues: {
							":Email": Email,
							":PhoneNumber": phonenumber,
						}
					}
					console.log(Userparams)
					var userresult = await db.connectionDB().scan(Userparams, async function(err,response){
						if(err){
						   return err;
						}else{
							var returndata = response.Items;
							return returndata;
						}
					}).promise().then(async(val)=>{
						var data = val.Items
						return data
					})
					if(userresult){
						DeviceID = userresult[0].DeviceID
					}
					msgdata = messageconfig.posnotification
					notoficationmsg = msgdata.replace(/OrganizationName/gi, OrganizationName);
					const client = new OneSignal.Client('b6a7101a-ae38-4003-b5ac-865e5ae1ebf4', 'OGIwYmM2MzgtNjA1OC00ZWUxLWE5MDUtMGNlMDdkYzZiN2M4');
					const notification = {
						"headings": {"en": "Recbook"},
						contents: {
							'en': notoficationmsg,
						},
						"include_player_ids": [DeviceID],
						"data": {"task": "sent through API"},
					};
					console.log(notification)
					// using async/await
					try {
						const response = await client.createNotification(notification);
						console.log(response.body.id);
					} catch (e) {
						if (e instanceof OneSignal.HTTPError) {
						// When status code of HTTP response is not 2xx, HTTPError is thrown.
							console.log(e.statusCode);
							console.log(e.body);
						}
					}
				}
				var returndata = common_service.success(200, messageconfig.AddReceipt,result1)
				return returndata
			}else{
				var returndata = common_service.success(400, messageconfig.Invalid,'')
				return returndata
			}
		}else{
			var returndata = common_service.success(400, messageconfig.AuthenticateKey,'')
			return returndata
		}
	}else{
		var returndata = common_service.success(400, messageconfig.AuthenticateKey,'')
		return returndata
	}
}

async function App_Receipt_scan(userparms){
	User_ID = userparms.UserID
	User_Email = userparms.Email
	User_Phone = userparms.PhoneNumber
	orignalstring = userparms.stringData
	var receipparmas = {
		"User_ID": User_ID,
		"User_Phone":User_Phone,
		"User_Email":User_Email,
		"OriginalData":orignalstring,
		"Type":"App",
	}
	console.log(receipparmas)
	Receipt.config({tableName: 'Receipt'});
	var result =  await Receipt.create(receipparmas)
	if(result){
		lastInsertID =result.attrs.ID
		var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
		var MonthName = dateFormat(date, "mmmm" )
		var returndata = common_service.success(200, "Receipt Added Succesfully.",result)
		return returndata
	}else{
		var returndata = common_service.success(400, "Something went wrong.",'')
		return returndata
	}
}

async function Email_attchment(userparms){
		userID = userparms.UserID
		userEmail = userparms.UserEmail
		todate = userparms.todate
		fromdate = userparms.fromdate
		AttchementType = userparms.AttchementType
		if(fromdate == todate){
			var params = {
				TableName: "CustomerReceipts",
				FilterExpression: "UserId = :UserId and ReceiptDate = :ReceiptDate and RecordStatus = :RecordStatus",
				ExpressionAttributeValues: {
					":UserId": userID,
					":ReceiptDate":fromdate,
					":RecordStatus":"1",
				},
			};
		}else{
			var params = {
				TableName: "CustomerReceipts",
				FilterExpression: "UserId = :UserId and ReceiptDate BETWEEN :fromdate and :todate and RecordStatus = :RecordStatus",
				ExpressionAttributeValues: {
					":UserId": userID,
					":fromdate":fromdate,
					":todate":todate,
					":RecordStatus":"1",
				},
			};
		}
		console.log(params)
		var tmp = []
		var dataarr = []
		var result = await db.connectionDB().scan(params, async function(err,response){
			if(err){
				return err;
			}else{
				var custmerreceipt = response.Items;
				return custmerreceipt;
			}
		}).promise().then(async(val)=>{
			var result = val.Items;
			var SortarryResult = _.orderBy(result,'CreatedDateTIme','desc');
			return SortarryResult
		})
		var receiptdata = result
		console.log(receiptdata)
		var receiptarr =[]
		var temp = []
		var html = null
		if(receiptdata != ''){
			for(let i=0 ;i < receiptdata.length ; i++){
				var receiptid = receiptdata[i].ReceiptId
				var CustomerreceiptID = receiptdata[i].ID
				var Receiptdate = receiptdata[i].CreatedDateTIme
				var MonthName = receiptdata[i].MonthName
				var RecordStatus = receiptdata[i].RecordStatus
				if(RecordStatus == "1"){
					Receipt.config({tableName: 'Receipt'});
					var receipparmas = {
						"ID":receiptid
					}
					var receiptresult =  await Receipt.get(receipparmas)
					console.log(receipparmas)
					receiptresult.attrs.Receiptdate = Receiptdate
					Trascationdatetime = receiptresult.attrs.TranscationDateTime
					if(Trascationdatetime != undefined){
						receiptresult.attrs["Trascationdatetime"] = Trascationdatetime
					}else{
						receiptresult.attrs["Trascationdatetime"] = ""
					}
					receiptresult.attrs["CustomerReceiptID"] = CustomerreceiptID
					receiptresult.attrs.MonthName = MonthName
					var paymentTypeID = receiptresult.attrs.PaymentType
					var TotalAmount = receiptresult.attrs.TotalAmount
					if(paymentTypeID){
						PaymentType.config({tableName: 'PaymentType'});
						var PaymentTypeparmas = {
							"ID":paymentTypeID
						}
						var paymentyperesult =  await PaymentType.get(PaymentTypeparmas)
						if(paymentyperesult){
							var PaymentName = paymentyperesult.attrs.PaymentName
							receiptresult.attrs.PaymentName = PaymentName
						}else{
							var PaymentName =paymentTypeID
							receiptresult.attrs.PaymentName = PaymentName
						}
					}
					var businessID = receiptresult.attrs.BusinessId
					if(businessID){
						Businesses.config({tableName: 'Businesses'});
						var businessparmas = {
							"ID":businessID
						}
						var businessresult =  await Businesses.get(businessparmas)
						if(businessresult){
							var BusinessName = businessresult.attrs.BusinessName
							var BusinessAddress = businessresult.attrs.BusinessAddress
							var BusinessPhone = businessresult.attrs.BusinessPhone
							receiptresult.attrs.BusinessName = BusinessName
							receiptresult.attrs.BusinessAddress = BusinessAddress
						}
					}
					temp[i] = receiptresult
					receiptarr.push(receiptresult)
				}
			}
			if(AttchementType == "PDF"){
				if(receiptarr){
					var k =1
					var html1 = "<body> <h2 style='text-align: center;'>ReceiptData</h2><center> <table style='border: 1px solid #eee; padding: 0px; border-spacing: 0px;'> <thead> <tr> <th style='background-color: #4CAF50; padding: 10px 10px 10px 6px; text-align: left; color: #fff;font-size: 14px; line-height: 24px;'>No</th> <th style='background-color: #4CAF50; padding: 10px 10px 10px 0px; text-align: left; color: #fff;font-size: 14px; line-height: 24px;'>Name</th> <th style='background-color: #4CAF50; padding: 10px 10px 10px 0px; text-align: left; color: #fff;font-size: 14px; line-height: 24px;'>Address</th> <th style='background-color: #4CAF50; padding: 10px 10px 10px 0px; text-align: left; color: #fff;font-size: 14px; line-height: 24px;'>Total Amount</th> <th style='background-color: #4CAF50; padding: 10px 10px 10px 0px; text-align: left; color: #fff;font-size: 14px; line-height: 24px;'>Payment</th> <th style='background-color: #4CAF50; padding: 10px 0px; text-align: left; color: #fff;font-size: 14px; line-height: 24px;'>Date</th> </tr></thead>"
					for(i=0;i< temp.length;i++){
						BusinessName = temp[i].attrs.BusinessName 
						BusinessAddress = temp[i].attrs.BusinessAddress 
						TotalAmount = temp[i].attrs.TotalAmount 
						if(temp[i].attrs.PaymentName == undefined){
							PaymentName = ""
						}else{
							PaymentName = temp[i].attrs.PaymentName
						}
						if(temp[i].attrs.TranscationDateTime == undefined){
							TranscationDateTime = '' 
						}else{
							TranscationDateTime = temp[i].attrs.TranscationDateTime 
						}
						No = k
						var html = "<tr style='background-color: #f2f2f2;height: 40px;'> <td style='font-size: 12px; line-height: 22px; padding-left: 6px;'>"+No+"</td><td style='font-size: 12px; line-height: 22px;'>"+BusinessName+"</td><td style='font-size: 12px; line-height: 22px;'>"+BusinessAddress+"</td><td style='font-size: 12px; line-height: 22px;'>"+TotalAmount+"</td><td style='font-size: 12px; line-height: 22px;'>"+PaymentName+"</td><td style='font-size: 12px; line-height: 22px;'>"+TranscationDateTime+"</td></tr>"
						k++
						html1 += html
					}
					var html2 = html1+"</table></center></body>"
					var options = { format: 'A4' };
					console.log(html2)
					pdf.create(html2,options).toFile(__dirname +'/Pdf/ReceiptData.pdf', function(err, res) {
						if (err) return console.log(err);
						console.log(res); 
					});
					var mail = nodemailer.createTransport({
					host: "mail.3iinfo.com",
					port: 465,
					secure: true, // true for 465, false for other ports
					auth: {
						user: "developer@3iinfo.com", // generated ethereal user
						pass:  "311nf0C0m"
					},
					tls: {
						rejectUnauthorized: false
						}
					});
					var mailOptions = {
						from: 'developer@3iinfo.com',
						to: userEmail,
						subject: 'ReceiptPdf',
						html: '<h3>Hello</h3><p>Please see attchment</p>' ,
						attachments: [{
							filename: 'Receipt.pdf',
							path: __dirname + '/Pdf/ReceiptData.pdf',
							contentType: 'application/pdf'
						}]
					}	
					mail.sendMail(mailOptions, function(error, info){
						console.log("123")
						if (error) {
							console.log(error);
						} else {
							console.log('Email sent: ' + info.response);
							fs.unlinkSync(__dirname + '/Pdf/ReceiptData.pdf');
							console.log('File deleted!');
						}
					});
				}
				var returnorderitem = await common_service.success(200, messageconfig.PDF,receiptarr)
				return returnorderitem
			}
			if(AttchementType == "CSV"){
			var k =1
			for(i=0;i< temp.length;i++){
				BusinessName = temp[i].attrs.BusinessName 
				BusinessAddress = temp[i].attrs.BusinessAddress 
				TotalAmount = temp[i].attrs.TotalAmount 
				MonthName = temp[i].attrs.MonthName 
				if(temp[i].attrs.PaymentName == undefined){
					PaymentName = ""
				}else{
					PaymentName = temp[i].attrs.PaymentName
				}
				if(temp[i].attrs.TranscationDateTime == undefined){
					TranscationDateTime = '' 
				}else{
					TranscationDateTime = temp[i].attrs.TranscationDateTime 
				}
				dataarr.push({
					No:k,
					Vendor:BusinessName,
					VendorAddress:BusinessAddress,
					TranscationDateTime:TranscationDateTime,
					PaymentType:PaymentName,
					TotalAmount:TotalAmount,
				})
				k++
			}
			console.log(dataarr)
			var mail = nodemailer.createTransport({
				host: "mail.3iinfo.com",
				port: 465,
				secure: true, // true for 465, false for other ports
				auth: {
					user: "developer@3iinfo.com", // generated ethereal user
					pass:  "311nf0C0m"
				},
				tls: {
					rejectUnauthorized: false
				}
			})
			var mailOptions = {
				from: 'developer@3iinfo.com',
				to: userEmail,
				subject: 'ReceiptCSV',
				html: '<h3>Hello</h3><p>Please see attchment</p>' ,
				attachments: [{
					filename: 'Receipt.csv',
					content: csv(dataarr),
				}]
			}	
			mail.sendMail(mailOptions, function(error, info){
				console.log("sendMail")
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
			var returnorderitem = await common_service.success(200, messageconfig.CSV,receiptarr)
			return returnorderitem
		}
		}else{
			var returnorderitem = await common_service.success(400, messageconfig.ReceiptNot,'')
			return returnorderitem
		}
}
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',' https://www.googleapis.com/auth/gmail.addons.current.message.action ',' https://www.googleapis.com/auth/gmail.addons.current.message.readonly',,'https://www.googleapis.com/auth/gmail.modify'];
var gmail = google.gmail('v1');
async function Get_Email_scan_Receipt(userparms){
	access_token = userparms.access_token
	expiry_date = userparms.expiry_date
	userID = userparms.UserID
	var credentials ={
		"web":{"client_id":"62953192951-kf0k1hvfct0eidk6emgote81516v7rn3.apps.googleusercontent.com","project_id":"my-project-270011","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"1nJ2WkcrrjuIb1bV__i9BE_k","redirect_uris":["http://localhost:8080/email_scan","http://localhost:8100","http://localhost:4200"],"javascript_origins":["http://localhost","http://localhost:8100","http://localhost:4200"]}
	}
	var clientSecret = credentials.web.client_secret;
	var clientId = credentials.web.client_id;
	var redirectUrl = credentials.web.redirect_uris[0];
	var OAuth2 = google.auth.OAuth2;
	var oauth2Client = new OAuth2(clientId, clientSecret,  redirectUrl);
	var auth = {
		access_token: access_token,
		scope: 'https://www.googleapis.com/auth/gmail.settings.basic https://www.googleapis.com/auth/gmail.addons.current.message.action https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.addons.current.message.readonly https://www.googleapis.com/auth/gmail.readonly',
		token_type: 'Bearer',
		expiry_date: expiry_date
	}
	oauth2Client.credentials = auth; // autencation in google login
	var params={
		"ID":userID,
		"authToken":access_token,
		"Token_expiry_date":expiry_date,
	}
	User.config({tableName: 'Users'});
	var TokenData = await User.update(params)
	if(TokenData){
		userPhone = TokenData.attrs.PhoneNumber
		userEmail = TokenData.attrs.Email
	}
	
	//var datetime = '2020-03-23'
	//var date = 'in:inbox before:'+datetime+'subject:Fwd: Receipt for Your Payment to'
	//var date = 'subject:ricept sending'
	var date = '{subject:Invoice subject:Bill subject:ricept sending}'
	var emailparams = {
		auth: oauth2Client, userId: 'me','q': date
	}
	var gmaildata = await gmail.users.messages.list(emailparams , async function(err, response) {
		if (err) {
			console.log('The API returned an error: ' + err);
			return;
		}
		//Get the message id which we will need to retreive tha actual message next.
		var message_ids = response['data']['messages'];
		//console.log(message_ids)
		if(message_ids != undefined){
			message_ids.forEach(element=>{
			//getAttachments("me",element.id,oauth2Client)
			messageID = element.id
			// Retreive the actual message using the message id
				var tempdata = gmail.users.messages.get({auth: oauth2Client, userId: 'me', 'id': element.id,format: 'full'}, async function(err, response) {
					if (err) {
						console.log('The API returned an error: ' + err);
						return;
					}
					// Access the email body content, like this...
					message_raw = response['data']['payload']['parts'][0].body.data;
					if(message_raw){
						data = message_raw;
						const result = Buffer.from(data, 'base64').toString('utf8');
						//console.log(result)
						var dataa = await simpleParser(result)
						console.log("Gautam",dataa.textAsHtml)
						// var dataa = await simpleParser(result,(err, parsed) => {
						// 	msgtext = parsed.textAsHtml
						// });
						var messgaeparams={
							TableName: "Receipt",
							ProjectionExpression: 'ID,User_ID,MessageEmailID',
							FilterExpression: "User_ID = :User_ID and MessageEmailID = :MessageEmailID",
							ExpressionAttributeValues: {
								":User_ID": userID,
								":MessageEmailID": messageID,
							}
						}
						var messgaeresult = await db.connectionDB().scan(messgaeparams, async function(err,response){
							if(err){
								return err;
							}else{
								var returndata = response.Items;
								return returndata;
							}
						}).promise().then((val)=>{
							return val
						})
						finalmessgaedata = messgaeresult.Items
						console.log(finalmessgaedata)
						if(finalmessgaedata != ''){
							for(let i=0 ;i < finalmessgaedata.length ; i++){
								var msgID = finalmessgaedata[i].MessageEmailID
								console.log(msgID)
								if(messageID != msgID){
									// var receipparmas = {
									//     "User_ID": userID,
									//     "User_Phone":userPhone.toString(),
									//     "User_Email":userEmail,
									//     "Type":"Email",
									//     "MessageEmailID":messageID,
									//     "OriginalData":dataa.textAsHtml,
									// }
									// Receipt.config({tableName: 'Receipt'});
									// var result1 =  await Receipt.create(receipparmas)
									console.log("INsert")
								}else{
									console.log("Not INsert")
								}
							}
						}else{
							console.log("else insert")
							//  var receipparmas = {
							//     "User_ID": userID,
							//     "User_Phone":userPhone.toString(),
							//     "User_Email":userEmail,
							//     "Type":"Email",
							//     "MessageEmailID":messageID,
							//     "OriginalData":dataa.textAsHtml,
							// }
							// Receipt.config({tableName: 'Receipt'});
							// var result1 =  await Receipt.create(receipparmas)
						}
					}
				});
			});
			var returndata = common_service.success(200, "Receipt Added Succesfully.",'')
			return returndata
		}else{
			var returndata = common_service.success(400, "Something went wrong.",'')
			return returndata
		}
	})
	var returndata = common_service.success(200, "Receipt Added Succesfully.",'')
	return returndata
	
}