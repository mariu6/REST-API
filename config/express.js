const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require("express");
const cors = require('cors');
const secret = 'secret';

module.exports = (app) => {
    app.use(cors({ exposedHeaders: "Authorization" }));   // за да може да избегнем крос-оригин - app.use(cors())  Също посочваме кои хедъри ще използваме...

    app.use(express.json());             // за да може да работи с json-и. ВАЖНО Е! 

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(cookieParser(secret));
};