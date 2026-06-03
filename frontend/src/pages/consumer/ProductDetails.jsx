import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaStar, FaArrowLeft } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dummy rating data
  const [ratingData] = useState({
    averageRating: 4.5,
    totalReviews: 128,
    ratings: [
      { stars: 5, count: 85, percentage: 66.4 },
      { stars: 4, count: 28, percentage: 21.9 },
      { stars: 3, count: 10, percentage: 7.8 },
      { stars: 2, count: 3, percentage: 2.3 },
      { stars: 1, count: 2, percentage: 1.6 },
    ],
    reviews: [
      {
        id: 1,
        name: "Rahul Sharma",
        rating: 5,
        comment: "Excellent product! Great quality and fast delivery. Highly recommended!",
        date: "2 days ago",
      },
      {
        id: 2,
        name: "Priya Patel",
        rating: 4,
        comment: "Good product, matches the description. Packaging could be better.",
        date: "1 week ago",
      },
      {
        id: 3,
        name: "Amit Kumar",
        rating: 5,
        comment: "Best purchase I've made. Worth every rupee!",
        date: "2 weeks ago",
      },
      {
        id: 4,
        name: "Sneha Reddy",
        rating: 4,
        comment: "Nice product, good quality. Would buy again.",
        date: "3 weeks ago",
      },
    ],
  });

  useEffect(() => {
    // Find product from context or fetch if needed
    const foundProduct = products.find((p) => p.product_id === parseInt(id));
    
    if (foundProduct) {
      setProduct(foundProduct);
      
      // Fetch image from Unsplash
      const fetchImage = async () => {
        try {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              foundProduct.name
            )}&per_page=1&client_id=${import.meta.env.VITE_UNSPLASH_API_KEY}`
          );
          if (response.ok) {
            const data = await response.json();
            setImageUrl(data.results[0]?.urls?.regular || foundProduct.product_image);
          } else {
            setImageUrl(foundProduct.product_image);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
          setImageUrl(foundProduct.product_image);
        } finally {
          setLoading(false);
        }
      };
      
      fetchImage();
    } else {
      setLoading(false);
    }
  }, [id, products]);

  if (loading) {
    return (
      <div className="min-h-screen text-[#f0f0f5] flex items-center justify-center p-4">
        <div className="skeleton w-full max-w-4xl h-[400px] rounded-2xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen text-[#f0f0f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Product not found</p>
          <button
            onClick={() => navigate("/consumer")}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const discount = parseFloat(product.discount || product.discount_value || 0);
  const finalPrice = price - (price * discount) / 100;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "text-yellow-400" : "text-gray-500"}
      />
    ));
  };

  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/consumer")}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative glass rounded-2xl overflow-hidden border border-white/5"
          >
            <img
              src={imageUrl || product.product_image || "https://via.placeholder.com/600"}
              alt={product.name}
              className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 right-4 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {discount.toFixed(0)}% OFF
              </span>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 md:p-8 rounded-2xl shadow-xl"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-100">{product.name}</h1>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(ratingData.averageRating))}
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-300">
                {ratingData.averageRating.toFixed(1)}
              </span>
              <span className="text-sm sm:text-base text-gray-500">({ratingData.totalReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-4 sm:mb-6">
              {discount > 0 ? (
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  <span className="text-lg sm:text-xl md:text-2xl text-gray-500 line-through">
                    ₹{price.toFixed(2)}
                  </span>
                  <span className="text-sm sm:text-base text-green-500 font-semibold">
                    Save ₹{(price - finalPrice).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500">
                  ₹{price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <span
                className={`inline-block px-4 py-2 rounded-full font-semibold ${
                  product.stock_quantity > 0
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {product.stock_quantity > 0
                  ? `In Stock (${product.stock_quantity} available)`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-orange-500">Description</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="mb-6 space-y-2">
              {product.category && (
                <div className="flex">
                  <span className="text-gray-400 w-32">Category:</span>
                  <span className="text-gray-200">{product.category}</span>
                </div>
              )}
              {product.exp_date && (
                <div className="flex">
                  <span className="text-gray-400 w-32">Expiry Date:</span>
                  <span className="text-gray-200">
                    {new Date(product.exp_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={() => addToCart(product.product_id, 1)}
              disabled={product.stock_quantity === 0}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(255,140,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}
            >
              <FaShoppingCart />
              {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </motion.button>
          </motion.div>
        </div>

        {/* Ratings & Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-8 rounded-2xl mt-8"
        >
          <h2 className="text-3xl font-bold mb-6 text-gradient">Ratings & Reviews</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Overall Rating */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-orange-500 mb-2">
                  {ratingData.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(ratingData.averageRating))}
                </div>
                <p className="text-gray-400">{ratingData.totalReviews} reviews</p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
              <h3 className="font-semibold mb-4 text-gray-200">Rating Breakdown</h3>
              <div className="space-y-3">
                {ratingData.ratings.map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm text-gray-400">{rating.stars}</span>
                      <FaStar className="text-yellow-400 text-xs" />
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${rating.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">
                      {rating.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-200">Customer Reviews</h3>
            <div className="space-y-4">
              {ratingData.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/5 p-6 rounded-xl border border-white/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-200 mb-1">{review.name}</h4>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-300">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProductDetails;
