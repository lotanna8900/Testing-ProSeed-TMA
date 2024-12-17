const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id/balance', userController.updateUserBalance);

module.exports = router;

