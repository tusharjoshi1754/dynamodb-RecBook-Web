const express = require('express');
const app = express();
const errorHandler = require('./helper/errorhandler');
const cors = require('cors');
const db = require('./helper/db');
const bodyParser = require('body-parser');
const jwt = require('./helper/jwt');

app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(jwt());

app.use(errorHandler);
app.use('/user',require('./frontend-Module/Register/register.controller'));
app.use('/login',require('./frontend-Module/Login/login.controller'));
app.use('/receipt',require('./frontend-Module/receipt/receipt.controller'));
app.use('/country',require('./frontend-Module/Country/Country.controller'));

const port = 8080;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});