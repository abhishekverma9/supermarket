import express from 'express'
import authRole from '../middlewares/authRole.js'
import upload from '../middlewares/multer.js'
import { addEmployee, deleteEmployee, getAllEmployees, getDashboardStats, updateDiscount, updateEmployee } from '../controllers/adminController.js'

const adminRouter = express.Router()

adminRouter.get("/employees",authRole("owner"),getAllEmployees)
adminRouter.post("/add",authRole("owner"),upload.single("profile_photo"),addEmployee)
adminRouter.post("/delete/:employee_id",authRole("owner"),deleteEmployee)
adminRouter.post("/update/:employee_id",authRole("owner"),updateEmployee)
adminRouter.post('/update-discount/:product_Id',authRole("owner"),updateDiscount)
adminRouter.get('/dashboard',authRole("owner"),getDashboardStats)

export default adminRouter