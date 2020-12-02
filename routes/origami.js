const controllers = require('../controllers/');
const router = require('express').Router();
const { auth } = require('../utils');
const { authNew } = require("../utils");

router.get('/', controllers.origami.get);

router.post('/', authNew(), controllers.origami.post);

router.put('/:id', authNew(), controllers.origami.put);

router.delete('/:id', authNew(), controllers.origami.delete);

module.exports = router;