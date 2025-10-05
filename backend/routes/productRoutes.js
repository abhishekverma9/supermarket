import express from 'express'
import { addProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from '../controllers/productController.js'
import authRole from '../middlewares/authRole.js'
import upload from '../middlewares/multer.js'

const productRouter = express.Router()

productRouter.get('/products',authRole("consumer","owner","employee"),getAllProducts)
productRouter.get("/products/:product_id", getProductById)
productRouter.post('/add',authRole("admin","employee"),upload.single("image"),addProduct)
productRouter.post('/update/:product_id',authRole("admin","employee"),updateProduct)
productRouter.post('/delete/:product_id', authRole("admin", "employee"), deleteProduct)


export default productRouter