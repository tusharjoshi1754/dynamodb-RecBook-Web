const express = require('express');
const router = express.Router();
const countryService = require('./Country.service')

router.get('/get_country', getCountry);
router.post('/add_country', addCountry);
router.post('/add_currecny', addCurrecny);
router.get('/get_currecny', getCurrecny);
module.exports = router;

async function getCountry(req,res,next){

	countryService.get_country_data()
	.then((role) =>
		role ? res.send({status:200,result:role})  : res.status(400).send({ message: 'Country Get failed'})
	)
	.catch(err => next(err));
}
async function getCurrecny(req,res,next){

	countryService.get_currency_data()
	.then((role) =>
		role ? res.send({status:200,result:role})  : res.status(400).send({ message: 'Currency Get failed'})
	)
	.catch(err => next(err));
}
async function addCountry(req,res,next){
	countryService.add_Country(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Country creation failed'}))
	.catch(err => next(err));
}
async function addCurrecny(req,res,next){
	countryService.add_Currecny(req.body)
	.then(role => role ? res.send({status:role.status,message:role.message,result:role.list}) : res.status(400).send({ message: 'Currency creation failed'}))
	.catch(err => next(err));
}