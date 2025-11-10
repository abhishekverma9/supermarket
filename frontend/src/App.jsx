import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import OwnerLayout from './layouts/OwnerLayout'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import EmployeeLayout from './layouts/EmployeeLayout'
import EmpDashboard from './pages/employee/EmpDashboard'
import ConsumerLayout from './layouts/ConsumerLayout'
import Dashboard from './pages/consumer/Dashboard'
import Orders from './pages/consumer/Orders'
import Cart from './pages/consumer/Cart'
import { ToastContainer } from 'react-toastify'
import Checkout from './pages/consumer/Checkout'
import AllOrders from './pages/employee/Orders'
import EmpProducts from './pages/employee/Products'
import EmpProfile from './pages/employee/Profile'
import OwnerEmployees from './pages/owner/Employees'
import OwnerProducts from './pages/owner/Products'
import OwnerOrders from './pages/owner/Orders'

const App = () => {
  return (
    <div className='min-h-screen bg-[#121212] text-[#F5F5F5]'>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<LoginPage />} />
        {/* Owner protected routes */}
        <Route element={<ProtectedRoute roles={["owner"]} />}>
          <Route element={<OwnerLayout />}>
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/all-orders" element={<OwnerOrders />} />
            <Route path="/owner/all-products" element={<OwnerProducts />} />
            <Route path="/owner/employees" element={<OwnerEmployees />} />
          </Route>
        </Route>

        {/* Employee protected routes */}
        <Route element={<ProtectedRoute roles={["employee"]} />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/employee" element={<EmpDashboard />} />
            <Route path="/employee/total-orders" element={<AllOrders/>} />
            <Route path="/employee/products" element={<EmpProducts/>} />
            <Route path="/employee/profile" element={<EmpProfile/>} />
          </Route>
        </Route>

        {/* Consumer protected routes */}
        <Route element={<ProtectedRoute roles={["consumer"]} />}>
          <Route element={<ConsumerLayout />}>
            <Route path="/consumer" element={<Dashboard/>} />
            <Route path="/consumer/orders" element={<Orders />} />
            <Route path="/consumer/cart" element={<Cart />} />
            <Route path="/consumer/checkout" element={<Checkout/>} />
          </Route>
        </Route>

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App
