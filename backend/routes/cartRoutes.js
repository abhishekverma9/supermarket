import express from "express";
import { addToCart, getCartItems, updateCartItem, removeCartItem, clearCart, checkout } from "../controllers/cartController.js";
import authRole from "../middlewares/authRole.js";

const cartRouter = express.Router();

cartRouter.use(authRole("consumer"));
cartRouter.post("/add", addToCart);         
cartRouter.get("/get", getCartItems);         
cartRouter.post("/update", updateCartItem);      
cartRouter.post("/remove/:cart_id", removeCartItem); 
cartRouter.post("/clear", clearCart);     
cartRouter.post("/checkout", checkout);     

export default cartRouter;
