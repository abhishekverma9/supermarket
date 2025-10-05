import express from 'express'
import authRole from '../middlewares/authRole.js'
import upload from '../middlewares/multer.js'
import { getAllOrders, getEmpProfile, getTeamMember, updateEmpProfile, updateOrderStatus } from '../controllers/employeeController.js'

const employeeRouter = express.Router()

employeeRouter.get("/orders",authRole("employee","owner"),getAllOrders)
employeeRouter.post('/status/:order_id',authRole("employee"),updateOrderStatus)
employeeRouter.get('/profile',authRole("employee"),getEmpProfile)
employeeRouter.post('/update-profile',authRole("employee"),upload.single("profile_photo"),updateEmpProfile)
employeeRouter.get('/team-member',authRole("employee"),getTeamMember)

export default employeeRouter