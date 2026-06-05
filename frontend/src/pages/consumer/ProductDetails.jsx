import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaStar, FaArrowLeft } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, fetchProductReviews, addProductReview, isGuest, formatDate } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Find product from context or fetch if needed
    const foundProduct = products.find((p) => p.product_id === parseInt(id));
    
    if (foundProduct) {
      setProduct(foundProduct);
      
      // Fetch image from Unsplash
      const fetchImage = async () => {
        const apiKey = import.meta.env.VITE_UNSPLASH_API_KEY;
        if (!apiKey) {
          setImageUrl(foundProduct.product_image);
          setLoading(false);
          return;
        }
        try {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              foundProduct.name
            )}&per_page=1&client_id=${apiKey}`
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
      
      // Fetch Reviews
      fetchProductReviews(foundProduct.product_id).then(fetchedReviews => {
        setReviews(fetchedReviews);
      });
    } else {
      setLoading(false);
    }
  }, [id, products]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) return;
    setIsSubmitting(true);
    const success = await addProductReview(product.product_id, newReview.rating, newReview.comment);
    if (success) {
      setNewReview({ rating: 5, comment: "" });
      // Refresh reviews
      const updatedReviews = await fetchProductReviews(product.product_id);
      setReviews(updatedReviews);
    }
    setIsSubmitting(false);
  };

  // Compute rating statistics dynamically
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0;

  const ratingsBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Product not found</p>
          <button
            onClick={() => navigate("/consumer")}
            className="px-6 py-2 bg-[#FF8C00] text-black rounded-lg hover:bg-[#ffa733] transition-colors"
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
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-4 sm:p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/consumer")}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base text-gray-400 hover:text-[#FF8C00] transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative bg-[#1e1e1e] rounded-2xl overflow-hidden border border-[#FF8C00]/30"
          >
            <img
              src={imageUrl || product.product_image || "https://via.placeholder.com/600"}
              alt={product.name}
              className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 right-4 bg-[#FF8C00] text-black text-sm font-bold px-3 py-1 rounded-full">
                {discount.toFixed(0)}% OFF
              </span>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#2E2E2E]/70 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-100">{product.name}</h1>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-300">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm sm:text-base text-gray-500">({totalReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-4 sm:mb-6">
              {discount > 0 ? (
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FF8C00]">
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
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FF8C00]">
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
              <h3 className="text-xl font-semibold mb-2 text-[#FF8C00]">Description</h3>
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
              className="w-full px-6 py-4 rounded-lg bg-[#FF8C00] hover:bg-[#ffa733] text-black font-semibold text-lg shadow-md flex items-center justify-center gap-2 transition-colors disabled:bg-gray-600 disabled:hover:bg-gray-600 disabled:cursor-not-allowed"
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
          className="bg-[#2E2E2E]/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30"
        >
          <h2 className="text-3xl font-bold mb-6 text-[#FF8C00]">Ratings & Reviews</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Overall Rating */}
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#FF8C00]/20">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-[#FF8C00] mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(averageRating))}
                </div>
                <p className="text-gray-400">{totalReviews} reviews</p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#FF8C00]/20">
              <h3 className="font-semibold mb-4 text-gray-200">Rating Breakdown</h3>
              <div className="space-y-3">
                {ratingsBreakdown.map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm text-gray-400">{rating.stars}</span>
                      <FaStar className="text-yellow-400 text-xs" />
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#FF8C00] h-2 rounded-full transition-all duration-500"
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

          {/* Add Review Form */}
          {!isGuest ? (
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#FF8C00]/20 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-200">Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Rating</label>
                  <div className="flex items-center gap-2 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`text-2xl transition-colors ${star <= newReview.rating ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400/50"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Comment</label>
                  <textarea
                    className="w-full bg-[#2E2E2E] border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF8C00]"
                    rows="3"
                    placeholder="Share your thoughts about this product..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#FF8C00] hover:bg-[#ffa733] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          ) : (
             <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#FF8C00]/20 mb-8 text-center">
               <p className="text-gray-400">You are browsing as a guest. Please <a href="/login" className="text-[#FF8C00] underline">log in</a> to leave a genuine review.</p>
             </div>
          )}

          {/* Customer Reviews List */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-200">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.review_id}
                    className="bg-[#1e1e1e] p-6 rounded-xl border border-[#FF8C00]/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-200 mb-1">{review.first_name} {review.last_name}</h4>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-300">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProductDetails;
