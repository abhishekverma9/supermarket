import { useState, useContext, createContext, useEffect } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";


export const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const navigate = useNavigate()
    const [token, setToken] = useState(localStorage.getItem("token") ? localStorage.getItem("token") : null)
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState([])
    const [orders, setOrders] = useState([])
    const [role, setRole] = useState(localStorage.getItem("role") ? localStorage.getItem("role") : "owner");
    const [allOrders, setAllOrders] = useState([])
    const [consumerProfile, setConsumerProfile] = useState(null)

    // Fetch consumer profile
    const fetchConsumerProfile = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/consumer/profile`, {
                headers: { token }
            });
            if (data.success) {
                setConsumerProfile(data.user);
            }
        } catch (err) {
            console.error("Error fetching consumer profile:", err);
        }
    };

    const updateConsumerProfile = async (profileData) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/consumer/update-profile`, profileData, {
                headers: { token }
            });
            if (data.success) {
                toast.success(data.message);
                fetchConsumerProfile();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
            return false;
        }
    };

    // Fetch cart items
    const fetchCartItems = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/cart/get`, {
                headers: { token },
            });
            if (data.success) {
                setCart(data.cart);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };
    // Add product to cart
    const addToCart = async (product_id, quantity = 1) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/cart/add`,
                { product_id, quantity },
                { headers: { token } }
            );
            if (data.success) {
                toast.success("Product added to cart");
                fetchCartItems();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };
    // Update cart item quantity
    const updateCartItem = async (cart_id, quantity) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/cart/update`,
                { cart_id, quantity },
                { headers: { token } }
            );
            if (data.success) {
                toast.success("Cart updated");
                fetchCartItems();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Remove item from cart
    const removeCartItem = async (cart_id) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/cart/remove/${cart_id}`, { cart_id },
                { headers: { token } }
            );
            if (data.success) {
                toast.info("Item removed");
                fetchCartItems();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/cart/clear`, {}, {
                headers: { token },
            });
            if (data.success) {
                toast.info("Cart cleared");
                setCart([]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Checkout
    const checkout = async (deliveryDetails) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/cart/checkout`,
                deliveryDetails, // contains receiver_name, phone, etc.
                { headers: { token } }
            );

            if (data.success) {
                toast.success("Order placed successfully");
                setCart([]);
                navigate("/consumer/orders"); // redirect to order page
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };
    const fetchAllProducts = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/product/products', { headers: { token } })
            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/order/orders`, {
                headers: { token }
            });
            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };
    const updateProduct = async (product_id, updatedFields) => {
        try {
            const { data } = await axios.post(backendUrl + `/api/product/update/${product_id}`, updatedFields, { headers: { token } });
            if (data.success) {
                setProducts((prev) =>
                    prev.map((p) =>
                        p.product_id === product_id ? { ...p, ...updatedFields } : p
                    )
                );
                toast.success(data.message)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Delete product
    const deleteProduct = async (product_id) => {
        try {
            const { data } = await axios.post(backendUrl + `/api/product/delete/${product_id}`, {}, { headers: { token } });
            if (data.success) {
                setProducts((prev) => prev.filter((p) => p.product_id !== product_id));
                toast.success(data.message)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const fetchAllOrderForEmp = async () => {
        try {
            const { data } = await axios.get(backendUrl + `/api/employee/orders`, { headers: { token } });
            if (data.success) {
                setAllOrders(data.orders)
                toast.success(data.message)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    useEffect(() => {
        if (token && role === "consumer") {
            fetchCartItems()
            fetchOrders()
            fetchConsumerProfile()
        }
        if (token && (role === "employee" || role === "owner")) {
            fetchAllOrderForEmp()
        }
        token && fetchAllProducts()
    }, [token,role])

    const value = {
        token, setToken,fetchAllProducts, backendUrl, products, setProducts, addToCart, updateCartItem, removeCartItem, checkout, clearCart, cart, fetchCartItems, orders, role, setRole, updateProduct, deleteProduct, formatDate, allOrders, consumerProfile, updateConsumerProfile
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
