import React, { useContext, useState, useEffect, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaTrash, FaSave, FaEdit, FaTimes, FaBox, FaLayerGroup, FaRupeeSign, FaCalendarAlt, FaWarehouse, FaFilter, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import FilterSidebar from "../consumer/FilterSidebar";
import axios from "axios";

const Dashboard = () => {
  const { updateProduct, deleteProduct, formatDate, backendUrl } = useContext(AuthContext);
  const [dashboardProducts, setDashboardProducts] = useState([]);
  const [editStates, setEditStates] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    priceRange: null,
  });
  
  // Pagination and Loading States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Fetch available categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
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
  }, [backendUrl]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
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

        const { data } = await axios.get(`${backendUrl}/api/product/products`, { 
          params,
          headers: { Authorization: localStorage.getItem("token") }
        });
        
        if (data.success) {
          if (page === 1) {
            setDashboardProducts(data.products);
          } else {
            setDashboardProducts((prev) => [...prev, ...data.products]);
          }
          setHasMore(data.currentPage < data.totalPages);
        } else {
          if (page === 1) setDashboardProducts([]);
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
  }, [searchQuery, selectedFilters, page, backendUrl]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedFilters]);

  // Handle Search from Navbar
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

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prev) => {
      if (type === "category") {
        const newCategories = prev.categories.includes(value)
          ? prev.categories.filter((c) => c !== value)
          : [...prev.categories, value];
        return { ...prev, categories: newCategories };
      }
      if (type === "priceRange") {
        const newPriceRange = prev.priceRange?.label === value.label ? null : value;
        return { ...prev, priceRange: newPriceRange };
      }
      return prev;
    });
  };

  const clearFilters = () => {
    setSelectedFilters({ categories: [], priceRange: null });
  };

  // Fetch images from Unsplash dynamically (matches Consumer Dashboard logic)
  useEffect(() => {
    const fetchImages = async () => {
      const updatedUrls = { ...imageUrls };
      let newImagesFetched = false;

      for (const product of dashboardProducts) {
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
    };

    if (dashboardProducts.length > 0) fetchImages();
  }, [dashboardProducts]);

  // Toggle edit mode
  const handleToggleEdit = (productId) => {
    setEditStates((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Local edit updates
  const handleLocalUpdate = (productId, field, value) => {
    setDashboardProducts((prev) =>
      prev.map((p) =>
        p.product_id === productId
          ? {
              ...p,
              [field]: field === "price" || field === "stock_quantity" ? parseFloat(value) || 0 : value,
            }
          : p
      )
    );
  };

  // Save changes to backend
  const handleSave = (product_id) => {
    const product = dashboardProducts.find((p) => p.product_id === product_id);
    if (!product) return;

    updateProduct(product_id, {
      price: product.price,
      stock_quantity: product.stock_quantity,
    });
    handleToggleEdit(product_id);
  };

  // Delete product
  const handleDelete = (product_id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(product_id);
      // Remove it from dashboard immediately for responsive UI
      setDashboardProducts(prev => prev.filter(p => p.product_id !== product_id));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6 lg:p-8">
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        availableCategories={availableCategories}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Header and Controls Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-orange-500 drop-shadow-[0_0_10px_rgba(255,140,0,0.4)]">
          {searchQuery.trim()
            ? `Results for "${searchQuery}"`
            : "Products Inventory"}
        </h2>

        {/* Filter Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 font-medium hover:bg-orange-500/10 hover:text-orange-500 hover:border-[#FF8C00]/30 transition-all text-sm"
          >
            <FaFilter size={12} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {loadingProducts && dashboardProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-orange-500 mb-4" size={40} />
          <p className="text-gray-400 font-medium">Loading inventory...</p>
        </div>
      ) : dashboardProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#2E2E2E]/70 backdrop-blur-xl p-12 rounded-2xl border border-[#FF8C00]/30 text-center"
        >
          <FaBox size={64} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 text-lg">No products available in inventory.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {dashboardProducts.map((p) => {
              const isEdit = editStates[p.product_id] || false;
              const imgSrc = imageUrls[p.product_id] || p.product_image;
              const stockQuantity = Number(p.stock_quantity);
              
              const stockStatus =
                stockQuantity === 0
                  ? { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Out of Stock" }
                  : stockQuantity < 10
                  ? { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", label: "Low Stock" }
                  : { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30", label: "In Stock" };

              return (
                <motion.div
                  key={p.product_id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(255,140,0,0.15)" }}
                  className="bg-[#2E2E2E]/70 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-[#FF8C00]/20 flex flex-col transition-all"
                >
                  <div className="relative">
                    <img src={imgSrc} alt={p.name} className="h-48 w-full object-cover" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-xs bg-black/70 backdrop-blur-md text-gray-200 px-2 py-1 rounded-md border border-white/10 shadow-sm">
                        ID: {p.product_id}
                      </span>
                    </div>
                    {p.discount_value && Number(p.discount_value) > 0 && (
                      <div className="absolute top-3 right-3 text-xs font-bold bg-orange-500 text-white px-2 py-1 rounded-md shadow-lg border border-orange-400">
                        {p.discount_value}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-100 mb-2 truncate">{p.name}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2" title={p.description}>{p.description}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                        <FaLayerGroup className="text-orange-500 w-4" />
                        <span>{p.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                        <FaCalendarAlt className="text-orange-500 w-4" />
                        <span>Exp: {formatDate(p.exp_date)}</span>
                      </div>
                    </div>

                    <div className={`mb-4 px-3 py-2 rounded-lg border ${stockStatus.bg} ${stockStatus.border}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                        <span className={`text-sm font-bold flex items-center gap-1 ${stockStatus.color}`}>
                          <FaWarehouse size={12} />
                          {stockQuantity} units
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-400 mb-1 block">Price</label>
                          {isEdit ? (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                              <input
                                type="number"
                                value={p.price}
                                onChange={(e) => handleLocalUpdate(p.product_id, "price", e.target.value)}
                                className="w-full pl-7 pr-2 py-2 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/40 focus:border-[#FF8C00] outline-none transition-colors"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-lg font-bold text-gray-100">
                              <FaRupeeSign className="text-orange-500" size={14} />
                              {Number(p.price).toFixed(2)}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-400 mb-1 block">Update Stock</label>
                          {isEdit ? (
                            <input
                              type="number"
                              value={p.stock_quantity}
                              onChange={(e) => handleLocalUpdate(p.product_id, "stock_quantity", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/40 focus:border-[#FF8C00] outline-none transition-colors"
                            />
                          ) : (
                            <div className="flex items-center text-lg font-bold text-gray-100 h-9">
                              {p.stock_quantity}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#FF8C00]/20 flex gap-2">
                        {isEdit ? (
                          <>
                            <button
                              onClick={() => handleSave(p.product_id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-2 rounded-lg font-semibold hover:bg-green-500/30 transition-colors"
                            >
                              <FaSave /> Save
                            </button>
                            <button
                              onClick={() => handleToggleEdit(p.product_id)}
                              className="flex items-center justify-center bg-gray-500/20 text-gray-400 border border-gray-500/40 px-3 py-2 rounded-lg font-semibold hover:bg-gray-500/30 hover:text-white transition-colors"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleEdit(p.product_id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 px-3 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.product_id)}
                              className="flex items-center justify-center bg-red-500/10 border border-red-500/30 text-red-500 px-3 py-2 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors"
                              title="Delete Product"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Load More Button */}
      {hasMore && dashboardProducts.length > 0 && !loadingProducts && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="group relative px-8 py-3 bg-[#2E2E2E]/70 hover:bg-[#FF8C00]/20 border border-[#FF8C00]/30 hover:border-[#FF8C00]/80 text-orange-500 rounded-full font-bold transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              Load More Products
            </span>
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingProducts && dashboardProducts.length > 0 && (
        <div className="mt-12 flex justify-center">
          <FaSpinner className="animate-spin text-orange-500" size={32} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;

