import React, { useContext, useEffect, useState, useMemo } from "react";
import { FaShoppingCart, FaFilter, FaSortAmountDown, FaHeart, FaRegHeart, FaSearchPlus, FaSpinner, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import FilterSidebar from "./FilterSidebar";
import axios from "axios";

const ProductGrid = () => {
  const navigate = useNavigate();
  const { addToCart, backendUrl, isGuest, products: contextProducts } = useContext(AuthContext);
  
  const [products, setProducts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [imagesLoading, setImagesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Pagination and Filters
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    priceRange: null,
  });
  const [sortBy, setSortBy] = useState("default");

  // Fetch available categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (isGuest) {
        setAvailableCategories(Array.from(new Set(contextProducts.map(p => p.category).filter(Boolean))));
        return;
      }
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/categories`, {
          headers: { Authorization: localStorage.getItem("token") }
        });
        if (data.success) {
          setAvailableCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [backendUrl, isGuest, contextProducts]);

  // Fetch products from backend or use mock data for guests
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);

      if (isGuest) {
        // Local filtering for guests
        const filtered = contextProducts.filter(p => {
          const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory = selectedFilters.categories.length === 0 || selectedFilters.categories.includes(p.category);
          const matchesPrice = !selectedFilters.priceRange ? true : (() => {
             const finalPrice = p.discount_value ? (p.price - (p.price * p.discount_value)/100) : p.price;
             return finalPrice >= selectedFilters.priceRange.min && finalPrice <= selectedFilters.priceRange.max;
          })();
          return matchesSearch && matchesCategory && matchesPrice;
        });
        
        // Sorting
        if (sortBy === "price-low") {
          filtered.sort((a, b) => {
            const priceA = a.discount_value ? (a.price - (a.price * a.discount_value)/100) : a.price;
            const priceB = b.discount_value ? (b.price - (b.price * b.discount_value)/100) : b.price;
            return priceA - priceB;
          });
        } else if (sortBy === "price-high") {
          filtered.sort((a, b) => {
            const priceA = a.discount_value ? (a.price - (a.price * a.discount_value)/100) : a.price;
            const priceB = b.discount_value ? (b.price - (b.price * b.discount_value)/100) : b.price;
            return priceB - priceA;
          });
        } else if (sortBy === "name") {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        // Pagination (local)
        const limit = 12;
        const offset = (page - 1) * limit;
        const paginated = filtered.slice(offset, offset + limit);

        if (page === 1) {
          setProducts(paginated);
        } else {
          setProducts(prev => [...prev, ...paginated]);
        }
        setHasMore(offset + limit < filtered.length);
        setLoadingProducts(false);
        return;
      }

      // Backend fetching for logged-in users
      try {
        const params = {
          search: searchQuery,
          page: page,
          limit: 12,
        };

        if (selectedFilters.categories.length > 0) {
          params.category = selectedFilters.categories.join(",");
        }

        if (selectedFilters.priceRange) {
          params.minPrice = selectedFilters.priceRange.min;
          params.maxPrice = selectedFilters.priceRange.max;
        }

        if (sortBy === "price-low") params.sortBy = "price_asc";
        else if (sortBy === "price-high") params.sortBy = "price_desc";
        else if (sortBy === "name") params.sortBy = "name";

        const { data } = await axios.get(`${backendUrl}/api/product/products`, { 
          params,
          headers: { Authorization: localStorage.getItem("token") }
        });
        
        if (data.success) {
          if (page === 1) {
            setProducts(data.products);
          } else {
            setProducts((prev) => [...prev, ...data.products]);
          }
          setHasMore(data.currentPage < data.totalPages);
        } else {
          if (page === 1) setProducts([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [searchQuery, selectedFilters, sortBy, page, backendUrl]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedFilters, sortBy]);

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
      setImagesLoading(true);
      const updatedUrls = { ...imageUrls };
      let newImagesFetched = false;

      for (const product of products) {
        if (!updatedUrls[product.product_id]) {
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
            newImagesFetched = true;
          } catch (error) {
            console.error("Error fetching Unsplash image:", error.message);
            updatedUrls[product.product_id] = product.product_image; // Fallback
            newImagesFetched = true;
          }
        }
      }
      if (newImagesFetched) {
        setImageUrls(updatedUrls);
      }
      setImagesLoading(false);
    };

    if (products.length > 0) fetchImages();
    else setImagesLoading(false);
  }, [products]);

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prevFilters) => {
      if (type === "category") {
        const newCategories = prevFilters.categories.includes(value)
          ? prevFilters.categories.filter((c) => c !== value)
          : [...prevFilters.categories, value];
        return { ...prevFilters, categories: newCategories };
      }
      if (type === "priceRange") {
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
  // useEffect(() => {
  //   console.log("Products updated:", products);
  // }, [products]);
  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6">
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        availableCategories={availableCategories}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-500">
          {searchQuery.trim()
            ? `Results for "${searchQuery}"`
            : "Featured Products"}
        </h2>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:border-[#FF8C00]/50 focus:outline-none appearance-none cursor-pointer hover:bg-white/8 transition-colors"
          >
            <option className="bg-[#1a1a1a] text-gray-300" value="default">Sort by</option>
            <option className="bg-[#1a1a1a] text-gray-300" value="price-low">Price: Low → High</option>
            <option className="bg-[#1a1a1a] text-gray-300" value="price-high">Price: High → Low</option>
            <option className="bg-[#1a1a1a] text-gray-300" value="name">Name: A → Z</option>
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

      {products.length === 0 && !loadingProducts ? (
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
          {products.map((product) => {
            const price = parseFloat(product.price);
            const finalPrice = product.final_price || price;
            const discount = parseFloat(product.discount_value || 0);

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
                  {imagesLoading && !imageUrls[product.product_id] ? (
                    <div className="w-full h-56 skeleton bg-white/5 animate-pulse" />
                  ) : (
                    <img
                      src={imageUrls[product.product_id] || product.product_image}
                      alt={product.name}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  
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

                <div className="p-5 flex flex-col flex-1">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      navigate(`/consumer/product/${product.product_id}`)
                    }
                  >
                    {product.category && (
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-orange-500 bg-orange-500/10 border border-[#FF8C00]/20 px-2.5 py-0.5 rounded-full mb-2">
                        {product.category}
                      </span>
                    )}
                    <h3 className="font-bold text-lg mb-2 text-gray-100 hover:text-orange-500 transition-colors">
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

      {/* Pagination Load More */}
      {hasMore && products.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loadingProducts}
            className="px-8 py-3 rounded-full border border-[#FF8C00]/40 text-orange-500 hover:bg-orange-500/10 font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProducts && <FaSpinner className="animate-spin" />}
            {loadingProducts ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {loadingProducts && products.length === 0 && (
        <div className="flex justify-center mt-10">
          <FaSpinner className="animate-spin text-orange-500 text-3xl" />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
