import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaStar, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

const RecommendationCarousel = ({ productId }) => {
  const navigate = useNavigate();
  const { token, addToCart, isGuest, products } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (isGuest) {
        // Show mock recommendations for guests since they don't have access to live DB
        const mockRecs = products
          .filter(p => p.product_id !== parseInt(productId))
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
        setRecommendations(mockRecs);
        fetchImages(mockRecs);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use Chatbot API for vector search recommendations
        const apiUrl = import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:8000";
        
        const response = await fetch(`${apiUrl}/recommend/${productId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_token: token || ""
          })
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        if (data.success && data.recommendations) {
          setRecommendations(data.recommendations);
          fetchImages(data.recommendations);
        }
      } catch (err) {
        console.error("Recommendation Error:", err);
        setError("Could not load similar products.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRecommendations();
    }
  }, [productId, token]);

  const fetchImages = async (products) => {
    const apiKey = import.meta.env.VITE_UNSPLASH_API_KEY;
    if (!apiKey) {
      const updatedUrls = {};
      for (const p of products) updatedUrls[p.product_id] = p.product_image;
      setImageUrls(updatedUrls);
      return;
    }

    const updatedUrls = {};
    for (const product of products) {
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            product.name
          )}&per_page=1&client_id=${apiKey}`
        );
        if (response.ok) {
          const data = await response.json();
          updatedUrls[product.product_id] =
            data.results[0]?.urls?.small || product.product_image;
        } else {
          updatedUrls[product.product_id] = product.product_image;
        }
      } catch {
        updatedUrls[product.product_id] = product.product_image;
      }
    }
    setImageUrls(updatedUrls);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, recommendations.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, recommendations.length - 3) : prev - 1));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/5 mt-8">
        <FaSpinner className="animate-spin text-orange-500 text-3xl mb-4" />
        <p className="text-gray-400">Finding similar products using AI...</p>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Don't show anything if no recommendations
  }

  return (
    <div className="mt-12 bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
      <h3 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-3">
        <span className="text-2xl">✨</span> Similar Products
      </h3>
      
      {/* Navigation Buttons */}
      {recommendations.length > 3 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-orange-500 hover:text-black transition-colors"
          >
            <FaChevronLeft />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-orange-500 hover:text-black transition-colors"
          >
            <FaChevronRight />
          </button>
        </>
      )}

      <div className="overflow-hidden px-4">
        <motion.div 
          className="flex gap-4 sm:gap-6"
          animate={{ x: `-${currentIndex * (100 / Math.min(3, recommendations.length))}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ width: `${(recommendations.length / Math.min(3, recommendations.length)) * 100}%` }}
        >
          {recommendations.map((product) => {
            const price = parseFloat(product.price);
            const discount = parseFloat(product.discount || product.discount_value || 0);
            const finalPrice = price - (price * discount) / 100;

            return (
              <motion.div
                key={product.product_id}
                className="w-full sm:w-1/2 md:w-1/3 flex-shrink-0 bg-[#1e1e24] border border-white/5 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:border-orange-500/30 transition-colors group"
                onClick={() => navigate(`/consumer/product/${product.product_id}`)}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={imageUrls[product.product_id] || product.product_image || "https://via.placeholder.com/300"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {discount > 0 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      {discount.toFixed(0)}% OFF
                    </span>
                  )}
                </div>
                
                <div className="p-4 flex flex-col h-[180px]">
                  {product.category && (
                    <span className="text-[10px] uppercase text-orange-500 font-semibold mb-1 tracking-wider">
                      {product.category}
                    </span>
                  )}
                  <h4 className="font-bold text-gray-100 text-base line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {product.name}
                  </h4>
                  
                  <div className="flex justify-between items-end mt-auto pt-4">
                    <div>
                      {discount > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 line-through">₹{price.toFixed(2)}</span>
                          <span className="font-bold text-orange-500 text-lg">₹{finalPrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-orange-500 text-lg">₹{price.toFixed(2)}</span>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.product_id, 1);
                      }}
                      disabled={product.stock_quantity === 0}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default RecommendationCarousel;
