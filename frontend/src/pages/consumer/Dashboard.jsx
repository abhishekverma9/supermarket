import React, { useContext, useEffect, useState, useMemo } from "react";
import { FaShoppingCart, FaFilter, FaSortAmountDown, FaHeart, FaRegHeart, FaSearchPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import FilterSidebar from "./FilterSidebar";

const ProductGrid = () => {
  const navigate = useNavigate();
  const { products, addToCart } = useContext(AuthContext);
  const [imageUrls, setImageUrls] = useState({});
  const [imagesLoading, setImagesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);

  // --- NEW STATE FOR FILTERS ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    priceRange: null,
  });
  const [sortBy, setSortBy] = useState("default");

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
      setImagesLoading(false);
    };

    if (products.length > 0) fetchImages();
    else setImagesLoading(false);
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

  const toggleWishlist = (e, productId) => {
    e.stopPropagation();
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
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

    // 4. Sort products
    if (sortBy === "price-low") {
      tempProducts.sort((a, b) => {
        const pa = parseFloat(a.price) - (parseFloat(a.price) * parseFloat(a.discount)) / 100;
        const pb = parseFloat(b.price) - (parseFloat(b.price) * parseFloat(b.discount)) / 100;
        return pa - pb;
      });
    } else if (sortBy === "price-high") {
      tempProducts.sort((a, b) => {
        const pa = parseFloat(a.price) - (parseFloat(a.price) * parseFloat(a.discount)) / 100;
        const pb = parseFloat(b.price) - (parseFloat(b.price) * parseFloat(b.discount)) / 100;
        return pb - pa;
      });
    } else if (sortBy === "name") {
      tempProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return tempProducts;
  }, [products, searchQuery, selectedFilters, sortBy]);

  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6">
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
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-500">
          {searchQuery.trim()
            ? `Results for "${searchQuery}"`
            : "Featured Products"}
        </h2>

        {/* --- Filter & Sort Buttons --- */}
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:border-[#FF8C00]/50 focus:outline-none appearance-none cursor-pointer hover:bg-white/8 transition-colors"
          >
            <option value="default">Sort by</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="name">Name: A → Z</option>
          </select>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-medium hover:bg-orange-500/10 hover:text-orange-500 hover:border-[#FF8C00]/30 transition-all text-sm"
          >
            <FaFilter size={12} />
            <span>Filters</span>
          </button>
        </div>
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
                className="bg-[#12121a]/80 border border-white/5 rounded-2xl overflow-hidden shadow-lg flex flex-col hover:border-[#FF8C00]/20 transition-colors"
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  className="relative group cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/consumer/product/${product.product_id}`)}
                >
                  {imagesLoading ? (
                    <div className="w-full h-56 skeleton" />
                  ) : (
                    <img
                      src={imageUrls[product.product_id] || product.product_image}
                      alt={product.name}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  
                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={(e) => toggleWishlist(e, product.product_id)}
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#FF4B91] hover:text-white transition-colors"
                    >
                      {wishlist.includes(product.product_id) ? <FaHeart className="text-[#FF4B91]" /> : <FaRegHeart />}
                    </button>
                    <button 
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
                    >
                      <FaSearchPlus />
                    </button>
                  </div>

                  {discount > 0 && (
                    <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
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
                    {/* Category Badge */}
                    {product.category && (
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-orange-500 bg-orange-500/10 border border-[#FF8C00]/20 px-2.5 py-0.5 rounded-full mb-2">
                        {product.category}
                      </span>
                    )}
                    <h3 className="font-bold text-lg mb-2 text-gray-100 hover:text-orange-500 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 min-h-[60px]">
                      {product.description}
                    </p>
                    {/* Price Section */}
                    <div className="flex justify-between items-center mb-4">
                      {discount > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-gray-500 line-through text-sm">
                            ₹{price.toFixed(2)}
                          </span>
                          <span className="text-xl font-semibold text-orange-500">
                            ₹{finalPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-semibold text-orange-500">
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
                    className="w-full px-4 py-3 mt-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold shadow-md flex items-center justify-center gap-2 transition-colors disabled:bg-gray-600 disabled:hover:bg-gray-600 disabled:cursor-not-allowed"
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
