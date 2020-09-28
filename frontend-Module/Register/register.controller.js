const express = require('express');
const router = express.Router();
const registerservice = require('./register.service')
var common_service = require('../../common_service')
const User = require('./register.model.ts');
const upload = require('../../file-upload');
const fs = require('fs')
let messageconfig = require("../../messageConfig.json")

router.post('/add_user', add);
router.get('/get_user', getData);
router.get('/get_userby_id/:id', getdatabyID);
router.put('/update_user', upload.array('image',1),updateData);
router.delete('/delete_user/:id', del_user);
//router.put('/updateprofile', updateProfileImage);
//router.put('/updateprofile',upload.array('image',1),updateProfileImage)

module.exports = router;
async function add(req,res,next){
	registerservice.add_user(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'User creation failed'}))
	.catch(err => next(err));
}

async function getData(req,res,next){

	registerservice.get_user_data()
	.then((role) =>
		role ? res.send({status:200,result:role})  : res.status(400).send({ message: 'User Get failed'})
	)
	.catch(err => next(err));
}

async function updateData(req,res,next){
	
	//console.log(req.body)
	if(req.files[0] == undefined){
		var ID = req.body.ID
		var Address = req.body.Address
		var Country = req.body.Country
		var State = req.body.State
		var City = req.body.City
		var PostalCode = req.body.PostalCode
		var PhoneNumber = req.body.PhoneNumber
		var UserName = req.body.UserName
		// var filelocation = req.files[0].location
		// var filename = req.files[0].originalname
		User.config({tableName: 'Users'});
		// var PhoneNumber = PhoneNumber == undefined ? "null" : PhoneNumber;
		// var Address = Address == undefined ? "null" : Address;
		// var Country = Country == undefined ? "null" : Country;
		// var State = State == undefined ? "null" : State;
		// var City = City == undefined ? "null" : City;
		// var PostalCode = PostalCode == undefined ? "null" : PostalCode;
		// var UserName = UserName == undefined ? "null" : UserName;
		
		var userparms ={
			"ID" :ID,
			"Address":Address,
			"Country":Country,
			"State":State,
			"City":City,
			"PostalCode":PostalCode,
			"UserName":UserName,
			//"PhoneNumber":PhoneNumber,
		}
		console.log(userparms)
		
		var result = await User.update(userparms)
		if(result){
			var returndata1 = res.send({"status":200, "message":messageconfig.UpdateProfile,"result":result})
			return returndata1
		}else{
			return false
		}
	}else{
		var ID = req.body.ID
		var Address = req.body.Address
		var Country = req.body.Country
		var State = req.body.State
		var City = req.body.City
		var PostalCode = req.body.PostalCode
		var PhoneNumber = req.body.PhoneNumber
		var UserName = req.body.UserName
		var filelocation = req.files[0].location
		var filename = req.files[0].originalname

		User.config({tableName: 'Users'});
		// var PhoneNumber = PhoneNumber == undefined ? "null" : PhoneNumber;
		// var Address = Address == undefined ? "null" : Address;
		// var Country = Country == undefined ? "null" : Country;
		// var State = State == undefined ? "null" : State;
		// var City = City == undefined ? "null" : City;
		// var PostalCode = PostalCode == undefined ? "null" : PostalCode;
		// var UserName = UserName == undefined ? "null" : UserName;
		
		var userparms ={
			"ID" :ID,
			"Address":Address,
			"Country":Country,
			"State":State,
			"City":City,
			"PostalCode":PostalCode,
			"UserName":UserName,
			//"PhoneNumber":PhoneNumber,
			"ProfileImage":filename,
			"ProfileUrl":filelocation,
		}
		console.log(userparms)
		var result = await User.update(userparms)
		if(result){
			var returndata1 = res.send({"status":200, "message":messageconfig.UpdateProfile,"result":result})
			return returndata1
		}else{
			return false
		}
	}
}

async function del_user(req,res,next){
	registerservice.del_user_data(req.params.id)
	.then(role => role ? res.send({status:200,result:role}) : res.status(400).send({ message: 'User Deletion failed'}))
	.catch(err => next(err));
}

async function getdatabyID(req,res,next){
	registerservice.get_userID(req.params.id)
	.then(role => role ? res.send({status:200,result:role}) : res.status(400).send({ message: 'User Deletion failed'}))
	.catch(err => next(err));
}

// async function updateProfileImage(req,res,next){
// 	var ID = req.body.ID
// 	var filelocation = req.files[0].location
// 	var filename = req.files[0].originalname
// 	User.config({tableName: 'Users'});
// 	var userparms ={
// 		"ID" :ID,
// 		"ProfileImage":filename,
// 		"ProfileUrl":filelocation
// 	}
// 	console.log(userparms)
// 	var result = await User.create(userparms)
// 	if(result){
// 		var returndata1 = res.send({"status":200, "message":"Image upload successfully","result":result})
//         return returndata1
//     }else{
//         return false
//     }
	
// }