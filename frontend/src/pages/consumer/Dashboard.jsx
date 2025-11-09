import React, { useContext } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const productsDummy = [
  {
    product_id: 1,
    name: "Organic Apples",
    description: "Fresh organic apples from the farm.",
    price: 150,
    discount_value: 10,
    final_price: 135,
    category: "Fruits",
    stock_quantity: 20,
    product_image: "https://via.placeholder.com/150",
  },
  {
    product_id: 2,
    name: "Whole Wheat Bread",
    description: "Healthy whole wheat bread.",
    price: 50,
    discount_value: 0,
    final_price: 50,
    category: "Bakery",
    stock_quantity: 15,
    product_image: "https://via.placeholder.com/150",
  },
  {
    product_id: 3,
    name: "Almond Milk",
    description: "Organic almond milk, unsweetened.",
    price: 120,
    discount_value: 5,
    final_price: 114,
    category: "Dairy",
    stock_quantity: 10,
    product_image: "https://via.placeholder.com/150",
  },
  // Add more products as needed
];

const ProductGrid = () => {
  const {products,addToCart} = useContext(AuthContext)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Featured Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.product_id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col"
          >
            <img
              src={product.product_image}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />

            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">{product.category}</p>

            <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{product.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <div>
                {product.discount_value > 0 ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 line-through text-sm">₹{product.price}</span>
                    <span className="text-green-600 font-bold">₹{product.final_price}</span>
                  </div>
                ) : (
                  <span className="text-gray-800 dark:text-gray-100 font-bold">₹{product.price}</span>
                )}
              </div>

              <button onClick={()=>addToCart(product.product_id,1)} className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition flex items-center gap-1">
                <FaShoppingCart /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
