import React, { useContext, useEffect, useState, useMemo } from "react";
import { FaShoppingCart, FaFilter, FaStar } from "react-icons/fa"; // Import FaFilter and FaStar
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import FilterSidebar from "./FilterSidebar"; // Import the new component

const ProductGrid = () => {
  const navigate = useNavigate();
  const { products, addToCart } = useContext(AuthContext);
  const [imageUrls, setImageUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // --- NEW STATE FOR FILTERS ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    priceRange: null,
  });

  // Get search query from localStorage
  useEffect(() => {
    const storedQuery = localStorage.getItem("searchQuery") || "";
    setSearchQuery(storedQuery);

    const handleSearchChange = (e) => {
      setSearchQuery(e.detail);
    };

    window.addEventListener("searchQueryChanged", handleSearchChange);

    return () => {
      window.removeEventListener("searchQueryChanged", handleSearchChange);
    };
  }, []);

  // Fetch images from Unsplash dynamically
  useEffect(() => {
    const fetchImages = async () => {
      const apiKey = import.meta.env.VITE_UNSPLASH_API_KEY;
      if (!apiKey) {
        // Skip fetching if API key is not configured
        const updatedUrls = {};
        for (const product of products) {
          updatedUrls[product.product_id] = product.product_image;
        }
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

  // --- NEW: GET AVAILABLE CATEGORIES ---
  const availableCategories = useMemo(() => {
    const categories = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(categories);
  }, [products]);

  // --- NEW: FILTER HANDLERS ---
  const handleFilterChange = (type, value) => {
    setSelectedFilters((prevFilters) => {
      if (type === "category") {
        // Toggle category in the array
        const newCategories = prevFilters.categories.includes(value)
          ? prevFilters.categories.filter((c) => c !== value)
          : [...prevFilters.categories, value];
        return { ...prevFilters, categories: newCategories };
      }
      if (type === "priceRange") {
        // If clicking the same range, deselect it. Otherwise, set it.
        const newPriceRange =
          prevFilters.priceRange?.label === value.label ? null : value;
        return { ...prevFilters, priceRange: newPriceRange };
      }
      return prevFilters;
    });
  };

  const clearFilters = () => {
    setSelectedFilters({ categories: [], priceRange: null });
  };

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

  // --- UPDATED: Filter products based on search AND new filters ---
  const filteredProducts = React.useMemo(() => {
    let tempProducts = [...products];

    // 1. Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tempProducts = tempProducts.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    // 2. Filter by category
    if (selectedFilters.categories.length > 0) {
      tempProducts = tempProducts.filter((product) =>
        selectedFilters.categories.includes(product.category)
      );
    }

    // 3. Filter by price
    if (selectedFilters.priceRange) {
      tempProducts = tempProducts.filter((product) => {
        const price = parseFloat(product.price);
        const discount = parseFloat(product.discount);
        const finalPrice = price - (price * discount) / 100;
        return (
          finalPrice >= selectedFilters.priceRange.min &&
          finalPrice <= selectedFilters.priceRange.max
        );
      });
    }

    return tempProducts;
  }, [products, searchQuery, selectedFilters]);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-4 sm:p-6 md:p-12">
      {/* --- NEW: Filter Sidebar Component --- */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        availableCategories={availableCategories}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Header and New Filter Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#FF8C00]">
          {searchQuery.trim()
            ? `Results for "${searchQuery}"`
            : "Featured Products"}
        </h2>

        {/* --- NEW: Filter Button --- */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#1e1e1e] border border-[#FF8C00]/50 rounded-lg text-[#FF8C00] font-semibold hover:bg-[#FF8C00] hover:text-black transition-colors text-sm sm:text-base"
        >
          <FaFilter />
          <span>Filters</span>
        </button>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-400 text-base sm:text-lg p-4 sm:p-10">
          {searchQuery.trim() ||
          selectedFilters.categories.length > 0 ||
          selectedFilters.priceRange
            ? `No products found matching your criteria.`
            : "No products available"}
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProducts.map((product) => {
            // Price & Discount Logic
            const price = parseFloat(product.price);
            const discount = parseFloat(product.discount);
            const finalPrice = price - (price * discount) / 100;

            return (
              <motion.div
                key={product.product_id}
                className="bg-[#1e1e1e] border border-[#FF8C00]/30 rounded-2xl overflow-hidden shadow-lg flex flex-col"
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
                  onClick={() =>
                    navigate(`/consumer/product/${product.product_id}`)
                  }
                >
                  <img
                    src={imageUrls[product.product_id] || product.product_image}
                    alt={product.name}
                    className="w-full h-56 object-cover"
                  />
                  {discount > 0 && (
                    <span className="absolute top-3 right-3 bg-[#FF8C00] text-black text-xs font-bold px-2 py-1 rounded-full">
                      {discount.toFixed(0)}% OFF
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      navigate(`/consumer/product/${product.product_id}`)
                    }
                  >
                    <h3 className="font-bold text-lg mb-2 text-gray-100 hover:text-[#FF8C00] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2 min-h-[40px] line-clamp-2">
                      {product.description}
                    </p>
                    {/* Rating Section */}
                    {product.average_rating !== undefined && (
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex text-sm text-[#FF8C00]">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.round(Number(product.average_rating)) ? "text-yellow-400" : "text-gray-600"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-1">
                          ({product.total_reviews} reviews)
                        </span>
                      </div>
                    )}
                    {/* Price Section */}
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

                      {/* Stock */}
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
                  {/* Add to Cart Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
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