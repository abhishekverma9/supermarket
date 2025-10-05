import express from "express";
import { getOrders, getOrderById } from "../controllers/orderController.js";
import authRole from "../middlewares/authRole.js";

const orderRouter = express.Router();

orderRouter.use(authRole("consumer"));
orderRouter.get("/orders", getOrders);       
orderRouter.get("/orders/:order_id", getOrderById); 

export default orderRouter;
