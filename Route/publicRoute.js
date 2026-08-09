const express = require('express');
const router  = express.Router();

const { BrowseRooms, ViewHotels } = require('../Controller/publicController');

router.get('/rooms',  BrowseRooms);
router.get('/hotels', ViewHotels);

module.exports = router;