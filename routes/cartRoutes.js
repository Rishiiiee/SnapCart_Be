    const express = require('express')
    const authMiddleware = require('../middleware/authmiddleware')
    const {Addtocart,Getcart,Updatecart,Deleteitem,Clearcart}=require('../controller/cartController')

    const cartRouter = express.Router()

    cartRouter.post('/addcart', authMiddleware ,  Addtocart)
    cartRouter.get('/getcart', authMiddleware ,  Getcart)
    cartRouter.put('/update/:id', authMiddleware ,  Updatecart)
    cartRouter.delete('/remove/:id', authMiddleware ,  Deleteitem)
    cartRouter.delete('/clear', authMiddleware ,  Clearcart)

    module.exports=cartRouter