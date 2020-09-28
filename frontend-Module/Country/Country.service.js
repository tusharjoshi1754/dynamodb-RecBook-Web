const db = require('../../helper/db');
const Country = require('./Country.model.ts');
const Currecny = require('./Currency.model.ts');
const dateFormat = require('dateformat');
var common_service = require('../../common_service')

module.exports = {
    get_country_data,
    add_Country,
    add_Currecny,
    get_currency_data
}

async function get_country_data(res) {
    var params = {
        TableName: "Country",
    };
    var result = await db.connectionDB().scan(params, function(err,data){
        if(err){
            return err;
        }else{
            var returndata = data.Items;
            return returndata
        }
    }).promise().then((val)=>{
        return val
    });
    return result
}

async function get_currency_data(res) {
    var params = {
        TableName: "Currency",
    };
    var result = await db.connectionDB().scan(params, function(err,data){
        if(err){
            return err;
        }else{
            var returndata = data.Items;
            return returndata
        }
    }).promise().then((val)=>{
        return val
    });
    return result
}

async function add_Country(userparms){
    var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
    Country.config({tableName: 'Country'});
    userparms['CreatedDateTime'] = date
    var result = await Country.create(userparms)
    if(result){
        var returndata2 = await common_service.success(200, "Country Add SuccessFully.",result)
        return returndata2
    }    
}

async function add_Currecny(userparms){
    var date = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss" )
    userparms['CreatedDateTime'] = date
    Currecny.config({tableName: 'Currency'});
    var result = await Currecny.create(userparms)
    if(result){
        var returndata2 = await common_service.success(200, "Currecny Add SuccessFully.",result)
        return returndata2
    }    
}