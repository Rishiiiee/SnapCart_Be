const express = require('express');
const { test, Register, Login, Logout, getuser } = require('../controller/usercontroller');
const authMiddleware = require('../middleware/authmiddleware');

const userRouter = express.Router();

userRouter.get('/test', test);
userRouter.post('/register', Register);
userRouter.post('/login', Login);
userRouter.get('/logout', Logout);
userRouter.get('/getuser', authMiddleware, getuser);

module.exports = userRouter;
