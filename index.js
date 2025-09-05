const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const userRouter = require('./routes/userRoutes');
const connectDB = require('./db/dbconnect');
const cookieParser = require('cookie-parser');
const productrouter = require('./routes/productRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const cors = require('cors');
const router = require('./routes/orderRoutes');


const app = express();


app.use(cors({
  origin: ["https://snap-cart-fe.vercel.app"], 
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());


app.use('/api/user', userRouter);
app.use('/api/products',productrouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',router)

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
});
