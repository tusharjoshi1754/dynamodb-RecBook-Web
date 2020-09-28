// const client = require('./_helper/db');
// const _ = require('lodash')
// const replaceString = require('replace-string');
// const config = require('./config.json');
module.exports = {
    error,
    success,
    diff_minutes,
    randomotp
}

async function error(code,message,data){
    var error=[]
    error['status']= code;
    error['message']=message;
    error['list']=data;
    return error
}

async function success(code,message,data){
    var error=[]
    error['status']= code;
    error['message']=message;
    error['list']=data;
    return error
}

function diff_minutes(dt2, dt1) 
{
	var diff =(dt2.getTime() - dt1.getTime()) / 1000;
	diff /= 60;
	return Math.abs(Math.round(diff));
 
}
function randomotp(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
