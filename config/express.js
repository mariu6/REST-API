const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require("express");
const cors = require('cors');
const secret = 'secret';

module.exports = (app) => {
    app.use(cors());
    app.use(express.json());   // за да може да работи с json-и. ВАЖНО Е! 

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(cookieParser(secret));
};