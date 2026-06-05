import { useState, useContext, createContext, useEffect } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";


export const AuthContext = createContext()

// Mock products for guest mode
const GUEST_MOCK_PRODUCTS = [
    { product_id: 1, name: "Fresh Organic Apples", description: "Crisp and juicy organic apples, perfect for healthy snacking.", price: 120, discount: 10, stock_quantity: 50, category: "Fruits", product_image: "https://images.unsplash.com/photo-1560806887-1e4b6e0c1b3e?w=400" },
    { product_id: 2, name: "Whole Wheat Bread", description: "Freshly baked whole wheat bread, soft and nutritious.", price: 45, discount: 0, stock_quantity: 30, category: "Bakery", product_image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
    { product_id: 3, name: "Farm Fresh Milk", description: "Pure and fresh cow's milk, pasteurized for safety.", price: 60, discount: 5, stock_quantity: 100, category: "Dairy", product_image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" },
    { product_id: 4, name: "Basmati Rice (5kg)", description: "Premium long-grain basmati rice, aged for perfect flavor.", price: 350, discount: 15, stock_quantity: 25, category: "Grains", product_image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { product_id: 5, name: "Extra Virgin Olive Oil", description: "Cold-pressed extra virgin olive oil, rich in antioxidants.", price: 550, discount: 20, stock_quantity: 15, category: "Cooking", product_image: "https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=400" },
    { product_id: 6, name: "Free Range Eggs (12)", description: "Farm-fresh free range eggs, rich in protein and nutrients.", price: 90, discount: 0, stock_quantity: 40, category: "Dairy", product_image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400" },
    { product_id: 7, name: "Organic Green Tea", description: "Premium organic green tea leaves, naturally refreshing.", price: 200, discount: 10, stock_quantity: 60, category: "Beverages", product_image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400" },
    { product_id: 8, name: "Dark Chocolate Bar", description: "Rich 70% cocoa dark chocolate, a guilt-free indulgence.", price: 150, discount: 5, stock_quantity: 0, category: "Snacks", product_image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400" },
];

export const AuthContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const navigate = useNavigate()
    const [token, setToken] = useState(localStorage.getItem("token") ? localStorage.getItem("token") : null)
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState([])
    const [orders, setOrders] = useState([])
    const [role, setRole] = useState(localStorage.getItem("role") ? localStorage.getItem("role") : "owner");
    const [isGuest, setIsGuest] = useState(localStorage.getItem("isGuest") === "true");

    // Guest login — sets up fake token + mock data, no backend needed
    const guestLogin = () => {
        const guestToken = "guest_token_" + Date.now();
        setToken(guestToken);
        setRole("consumer");
        setIsGuest(true);
        setProducts([...GUEST_MOCK_PRODUCTS]);
        setCart([]);
        setOrders([]);
        localStorage.setItem("token", guestToken);
        localStorage.setItem("role", "consumer");
        localStorage.setItem("isGuest", "true");
        toast.success("Signed in as Guest");
        navigate("/consumer");
    };

    // Guest logout cleanup
    const guestLogout = () => {
        setIsGuest(false);
        localStorage.removeItem("isGuest");
    };
    const [allOrders, setAllOrders] = useState([])
    const [consumerProfile, setConsumerProfile] = useState(null)

    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setRole("");
        navigate("/login");
    };

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (
                    error.response?.status === 401 && 
                    error.response?.data?.message === "Invalid or expired token."
                ) {
                    toast.info("Session expired. Please login again.");
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

    // Fetch consumer profile
    const fetchConsumerProfile = async () => {
        if (isGuest) return;
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
        if (isGuest) return; // Guest mode uses local state
        try {
            const { data } = await axios.get(`${backendUrl}/api/cart/get?t=${Date.now()}`, {
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
        if (isGuest) {
            setCart(prev => {
                const existing = prev.find(item => item.product_id === product_id);
                if (existing) {
                    return prev.map(item => item.product_id === product_id ? { ...item, quantity: item.quantity + quantity } : item);
                }
                const product = products.find(p => p.product_id === product_id);
                return [...prev, { cart_id: Date.now(), product_id, quantity, name: product?.name, price: product?.price, discount: product?.discount }];
            });
            toast.success("Product added to cart");
            return;
        }
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
        if (isGuest) {
            setCart(prev => prev.map(item => item.cart_id === cart_id ? { ...item, quantity } : item));
            toast.success("Cart updated");
            return;
        }
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
        if (isGuest) {
            setCart(prev => prev.filter(item => item.cart_id !== cart_id));
            toast.info("Item removed");
            return;
        }
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
        if (isGuest) {
            setCart([]);
            toast.info("Cart cleared");
            return;
        }
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
        if (isGuest) {
            const newOrder = {
                order_id: Date.now(),
                items: [...cart],
                total: cart.reduce((sum, item) => sum + (item.price - (item.price * (item.discount || 0)) / 100) * item.quantity, 0),
                status: "Processing",
                order_date: new Date().toISOString(),
                ...deliveryDetails,
            };
            setOrders(prev => [newOrder, ...prev]);
            setCart([]);
            toast.success("Order placed successfully (Guest Mode)");
            navigate("/consumer/orders");
            return;
        }
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/cart/checkout`,
                deliveryDetails, // contains receiver_name, phone, etc.
                { headers: { token } }
            );

            if (data.success) {
                toast.success("Order placed successfully");
                setCart([]);
                fetchOrders();
                navigate("/consumer/orders");
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return false;
        }
    };
    const fetchAllProducts = async () => {
        if (isGuest) {
            setProducts([...GUEST_MOCK_PRODUCTS]);
            return;
        }
        try {
            const { data } = await axios.get(`${backendUrl}/api/product/products?t=${Date.now()}`, { headers: { token } })
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
        if (isGuest) return; // Guest orders are managed locally
        try {
            const { data } = await axios.get(`${backendUrl}/api/order/orders?t=${Date.now()}`, {
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
    
    // Fetch product reviews
    const fetchProductReviews = async (product_id) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/product/${product_id}/reviews`);
            if (data.success) {
                return data.reviews;
            }
            return [];
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    // Add a product review
    const addProductReview = async (product_id, rating, comment) => {
        if (isGuest) {
            toast.error("Guests cannot leave reviews");
            return false;
        }
        try {
            const { data } = await axios.post(`${backendUrl}/api/product/${product_id}/reviews`, { rating, comment }, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
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
        if (isGuest) return;
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
        token, setToken, fetchAllProducts, backendUrl, products, setProducts, addToCart, updateCartItem, removeCartItem, checkout, clearCart, cart, fetchCartItems, orders, role, setRole, updateProduct, deleteProduct, formatDate, allOrders, isGuest, guestLogin, guestLogout, fetchProductReviews, addProductReview, consumerProfile, updateConsumerProfile, logout
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
