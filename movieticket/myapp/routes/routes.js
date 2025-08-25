const express = require('express'); 
const usercontrollers = require('../controllers/Usercontroller');
const router = express.Router();


router.get('/users', usercontrollers.userhomepage);
router.post('/addusers', usercontrollers.createUser);
router.get('/getallusers', usercontrollers.getAllUsers);
router.get('/getuserbyid/:id', usercontrollers.getUserById);
router.put('/updateuser/:id', usercontrollers.updateUser);
router.delete('/deleteuser/:id', usercontrollers.deleteUser);

module.exports = router;