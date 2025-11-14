import React, { useContext, useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";

const ProductGrid = () => {
  const navigate = useNavigate();
  const { products, addToCart } = useContext(AuthContext);
  const [imageUrls, setImageUrls] = useState({});

  // Fetch images from Unsplash dynamically (Preserved Logic)
  useEffect(() => {
    const fetchImages = async () => {
      const updatedUrls = {};
      for (const product of products) {
        try {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              product.name
            )}&per_page=1&client_id=${import.meta.env.VITE_UNSPLASH_API_KEY}`
          );
          if (!response.ok) throw new Error("Unsplash API limit or error");
          const data = await response.json();
          updatedUrls[product.product_id] =
            data.results[0]?.urls?.small || product.product_image;
        } catch (error) {
          console.error("Error fetching Unsplash image:", error.message);
          updatedUrls[product.product_id] = product.product_image; // Fallback
        }
      }
      setImageUrls(updatedUrls);
    };

    if (products.length > 0) fetchImages();
  }, [products]);

  // Animation Variants
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-6 md:p-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#FF8C00]">
        Featured Products
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-400">No products available</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((product) => {
            // Price & Discount Logic (Preserved)
            const price = parseFloat(product.price);
            const discount = parseFloat(product.discount);
            const finalPrice = price - (price * discount) / 100;

            return (
              <motion.div
                key={product.product_id}
                className="bg-[#1e1e1e] border border-[#FF8C00]/30 rounded-2xl overflow-hidden shadow-lg flex flex-col cursor-pointer" // Refined Card Style
                variants={cardVariants}
                whileHover={{
                  scale: 1.03,
                  y: -5,
                  boxShadow: "0px 10px 20px rgba(255, 140, 0, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div 
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/consumer/product/${product.product_id}`)}
                >
                  <img
                    src={imageUrls[product.product_id] || product.product_image}
                    alt={product.name}
                    className="w-full h-56 object-cover" // Consistent image height
                  />
                  {/* Discount Badge (Preserved) */}
                  {discount > 0 && (
                    <span className="absolute top-3 right-3 bg-[#FF8C00] text-black text-xs font-bold px-2 py-1 rounded-full">
                      {discount.toFixed(0)}% OFF
                    </span>
                  )}
                </div>

                {/* Card Content (Refined Layout) */}
                <div className="p-5 flex flex-col flex-1">
                  {" "}
                  {/* flex-1 makes this div grow */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/consumer/product/${product.product_id}`)}
                  >
                    {" "}
                    {/* This inner div pushes the button down */}
                    <h3 className="font-bold text-lg mb-2 text-gray-100 hover:text-[#FF8C00] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 min-h-[60px]">
                      {" "}
                      {/* Min-height for layout consistency */}
                      {product.description}
                    </p>
                    {/* Price Section (Preserved) */}
                    <div className="flex justify-between items-center mb-4">
                      {discount > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-gray-500 line-through text-sm">
                            ₹{price.toFixed(2)}
                          </span>
                          <span className="text-xl font-semibold text-[#FF8C00]">
                            ₹{finalPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-semibold text-[#FF8C00]">
                          ₹{price.toFixed(2)}
                        </span>
                      )}

                      {/* Stock (Preserved) */}
                      <span
                        className={`font-semibold text-sm ${
                          product.stock_quantity > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {product.stock_quantity > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                  {/* Add to Cart Button (Refined & Animated) */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation when clicking button
                      addToCart(product.product_id, 1);
                    }}
                    disabled={product.stock_quantity === 0}
                    className="w-full px-4 py-3 mt-2 rounded-lg bg-[#FF8C00] hover:bg-[#ffa733] text-black font-semibold shadow-md flex items-center justify-center gap-2 transition-colors disabled:bg-gray-600 disabled:hover:bg-gray-600 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaShoppingCart />
                    {product.stock_quantity > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default ProductGrid;