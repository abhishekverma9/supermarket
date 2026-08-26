import express from 'express'
import { addProduct, deleteProduct, getAllProducts, getCategories, getProductById, updateProduct } from '../controllers/productController.js'
import { addProductReview, getProductReviews } from '../controllers/reviewController.js'
import authRole from '../middlewares/authRole.js'
import upload from '../middlewares/multer.js'

const productRouter = express.Router()

productRouter.get('/products',authRole("consumer","owner","employee"),getAllProducts)
productRouter.get('/categories',authRole("consumer","owner","employee"),getCategories)
productRouter.get("/products/:product_id", getProductById)
productRouter.post('/add',authRole("admin","employee"),upload.single("image"),addProduct)
productRouter.post('/update/:product_id',authRole("admin","employee"),updateProduct)
productRouter.post('/delete/:product_id', authRole("admin", "employee"), deleteProduct)

// Review routes
productRouter.get('/:id/reviews', getProductReviews)
productRouter.post('/:id/reviews', authRole("consumer"), addProductReview)


export default productRouter