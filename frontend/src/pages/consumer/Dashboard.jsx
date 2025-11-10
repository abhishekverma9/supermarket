import React, { useContext, useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const ProductGrid = () => {
  const { products, addToCart } = useContext(AuthContext);
  const [imageUrls, setImageUrls] = useState({});

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
          const data = await response.json();
          updatedUrls[product.product_id] =
            data.results[0]?.urls?.small || product.product_image;
        } catch {
          updatedUrls[product.product_id] = product.product_image;
        }
      }
      setImageUrls(updatedUrls);
    };

    if (products.length > 0) fetchImages();
  }, [products]);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#FF8C00]">
        Featured Products
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-400">No products available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="bg-[#2E2E2E] rounded-2xl overflow-hidden shadow-lg transform transition hover:scale-105 hover:shadow-[#FF8C00]/30"
            >
              <div className="relative">
                <img
                  src={imageUrls[product.product_id] || product.product_image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {product.discount_value > 0 && (
                  <span className="absolute top-3 left-3 bg-[#FF8C00] text-black text-xs font-bold px-2 py-1 rounded-md">
                    {product.discount_value}% OFF
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{product.category}</p>
                  <p className="text-sm text-gray-300 mb-4">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-3">
                    {product.discount_value > 0 ? (
                      <>
                        <span className="text-gray-500 line-through text-sm">
                          ₹{product.price}
                        </span>
                        <span className="text-[#FF8C00] font-bold text-lg">
                          ₹{product.final_price}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#FF8C00] font-bold text-lg">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Stock:{" "}
                    <span
                      className={`font-semibold ${
                        product.stock_quantity > 5
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {product.stock_quantity}
                    </span>
                  </span>

                  <button
                    onClick={() => addToCart(product.product_id, 1)}
                    className="bg-[#FF8C00] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#ffa733] transition"
                  >
                    <FaShoppingCart /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
