import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaTrash, FaSave, FaEdit, FaTag, FaBox, FaCalendarAlt, FaPercent } from "react-icons/fa";
import axios from "axios";

const Dashboard = () => {
  const { products, setProducts, updateProduct, deleteProduct, formatDate, fetchAllProducts, token } = useContext(AuthContext);
  const [editStates, setEditStates] = useState({});
  const [unsplashImages, setUnsplashImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;
  const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";

  // Debug: Log products to console to help diagnose the issue
  useEffect(() => {
    console.log("EmpDashboard - Products:", products);
    console.log("EmpDashboard - Products length:", products?.length);
    console.log("EmpDashboard - Token:", token ? "Present" : "Missing");
  }, [products, token]);

  // Fetch image from Unsplash based on product name or category
  const fetchUnsplashImage = async (productName, category, productId) => {
    // Check if we already have the image cached
    if (unsplashImages[productId]) {
      return unsplashImages[productId];
    }

    setLoadingImages((prev) => ({ ...prev, [productId]: true }));

    try {
      const query = `${productName} ${category} product`.trim();
      const response = await axios.get(UNSPLASH_API_URL, {
        params: {
          query: query,
          per_page: 1,
          orientation: "squarish",
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        const imageUrl = response.data.results[0].urls.regular;
        setUnsplashImages((prev) => ({ ...prev, [productId]: imageUrl }));
        setLoadingImages((prev) => ({ ...prev, [productId]: false }));
        return imageUrl;
      }
    } catch (error) {
      console.error(`Error fetching image for ${productName}:`, error);
    }

    setLoadingImages((prev) => ({ ...prev, [productId]: false }));
    return null;
  };

  // Fetch images for all products when component mounts or products change
  useEffect(() => {
    if (products && products.length > 0) {
      // Fetch images with a small delay to avoid rate limiting
      products.forEach((product, index) => {
        // Only fetch if we don't have the image and aren't currently loading it
        if (!unsplashImages[product.product_id] && !loadingImages[product.product_id]) {
          // Add a small delay between requests to avoid rate limiting
          setTimeout(() => {
            fetchUnsplashImage(product.name, product.category, product.product_id);
          }, index * 100); // 100ms delay between each request
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Toggle edit mode for a product
  const handleToggleEdit = (productId) => {
    setEditStates((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Update product locally while editing
  const handleLocalUpdate = (productId, field, value) => {
    setProducts((prev) =>
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

  // Save updates to backend
  const handleSave = (product_id) => {
    const product = products.find((p) => p.product_id === product_id);
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
    }
  };

  // Get image URL - prefer Unsplash, fallback to product_image
  const getProductImage = (product) => {
    return unsplashImages[product.product_id] || product.product_image || "https://via.placeholder.com/400x300?text=No+Image";
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 -m-6 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3 drop-shadow-lg">
            <FaBox className="text-blue-400" />
            Products Management
          </h1>
          <p className="text-gray-300 text-lg">Manage your inventory and product details</p>
        </div>

        {/* Products Grid */}
        {products && products.length === 0 ? (
          <div className="text-center py-20">
            <FaBox className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No products found</p>
            <p className="text-gray-500 text-sm mt-2">Products will appear here once they are added to the system.</p>
            <button
              onClick={() => {
                console.log("Manual refresh triggered");
                fetchAllProducts();
              }}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Refresh Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => {
              const isEdit = editStates[p.product_id] || false;
              const imageUrl = getProductImage(p);
              const isLoading = loadingImages[p.product_id];

              return (
                <div
                  key={p.product_id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                >
                  {/* Image Container */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {isLoading ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 animate-pulse">
                        <div className="text-white text-sm">Loading image...</div>
                      </div>
                    ) : (
                      <img
                        src={imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                      />
                    )}
                    {/* Discount Badge */}
                    {p.discount_value > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                        <FaPercent className="text-xs" />
                        {p.discount_value}% OFF
                      </div>
                    )}
                    {/* Stock Badge */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                        p.stock_quantity > 10
                          ? "bg-green-500 text-white"
                          : p.stock_quantity > 5
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {p.stock_quantity} in stock
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Product Name */}
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">
                      {p.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                      {p.description}
                    </p>

                    {/* Category */}
                    <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-400">
                      <FaTag className="text-xs" />
                      <span className="text-sm font-medium">{p.category}</span>
                    </div>

                    {/* Price and Stock Section */}
                    <div className="space-y-3 mb-4">
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Price:</span>
                        {isEdit ? (
                          <input
                            type="number"
                            value={p.price}
                            onChange={(e) => handleLocalUpdate(p.product_id, "price", e.target.value)}
                            className="w-24 px-2 py-1 border border-blue-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            ₹{p.price}
                          </span>
                        )}
                      </div>

                      {/* Stock */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Stock:</span>
                        {isEdit ? (
                          <input
                            type="number"
                            value={p.stock_quantity}
                            onChange={(e) =>
                              handleLocalUpdate(p.product_id, "stock_quantity", e.target.value)
                            }
                            className="w-24 px-2 py-1 border border-blue-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-800 dark:text-white">
                            {p.stock_quantity} units
                          </span>
                        )}
                      </div>

                      {/* Expiry Date */}
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                        <FaCalendarAlt className="text-xs" />
                        <span>Expires: {formatDate(p.exp_date)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {isEdit ? (
                        <button
                          onClick={() => handleSave(p.product_id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <FaSave />
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleEdit(p.product_id)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <FaEdit />
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p.product_id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
