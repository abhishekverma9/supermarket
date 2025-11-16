import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaTrash, FaSave, FaEdit } from "react-icons/fa";

const Dashboard = () => {
  const { products, setProducts, updateProduct, deleteProduct, formatDate } = useContext(AuthContext);
  const [editStates, setEditStates] = useState({});
  const [imageUrls, setImageUrls] = useState({});

  // Fetch image from Unsplash for each product
  useEffect(() => {
    const fetchImages = async () => {
      const updatedUrls = {};
      for (const p of products) {
        try {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(p.name)}&per_page=1&client_id=${
              import.meta.env.VITE_UNSPLASH_API_KEY
            }`
          );
          const data = await response.json();
          updatedUrls[p.product_id] = data.results[0]?.urls?.small || p.product_image;
        } catch {
          updatedUrls[p.product_id] = p.product_image;
        }
      }
      setImageUrls(updatedUrls);
    };
    if (products.length > 0) fetchImages();
  }, [products]);

  // Toggle edit mode
  const handleToggleEdit = (productId) => {
    setEditStates((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Local edit updates
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

  // Save changes to backend
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

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#FF8C00]">Products Dashboard</h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-400">No products available</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const isEdit = editStates[p.product_id] || false;
            const imgSrc = imageUrls[p.product_id] || p.product_image;

            return (
              <div
                key={p.product_id}
                className="bg-[#2E2E2E] rounded-2xl shadow-lg overflow-hidden flex flex-col transition transform hover:-translate-y-1 hover:shadow-[#FF8C00]/60"
              >
                <img
                  src={imgSrc}
                  alt={p.name}
                  className="h-40 w-full object-cover"
                />

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{p.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{p.description}</p>
                    <p className="text-sm">
                      <span className="text-[#FF8C00] font-semibold">Category:</span> {p.category}
                    </p>
                    <p className="text-sm">
                      <span className="text-[#FF8C00] font-semibold">Exp. Date:</span> {formatDate(p.exp_date)}
                    </p>
                    <p className="text-sm">
                      <span className="text-[#FF8C00] font-semibold">Discount:</span> {p.discount_value}%
                    </p>

                    <div className="mt-3 flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-300">Price (₹)</label>
                      {isEdit ? (
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) =>
                            handleLocalUpdate(p.product_id, "price", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded bg-[#121212] text-white border border-[#FF8C00] focus:outline-none"
                        />
                      ) : (
                        <p className="text-lg font-bold">₹{p.price}</p>
                      )}

                      <label className="text-sm font-medium text-gray-300 mt-2">Stock</label>
                      {isEdit ? (
                        <input
                          type="number"
                          value={p.stock_quantity}
                          onChange={(e) =>
                            handleLocalUpdate(p.product_id, "stock_quantity", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded bg-[#121212] text-white border border-[#FF8C00] focus:outline-none"
                        />
                      ) : (
                        <p className="text-lg font-semibold">{p.stock_quantity}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    {isEdit ? (
                      <button
                        onClick={() => handleSave(p.product_id)}
                        className="flex items-center gap-2 bg-[#FF8C00] text-black px-3 py-2 rounded-lg font-semibold hover:bg-[#ffa733] transition"
                      >
                        <FaSave /> Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleEdit(p.product_id)}
                        className="flex items-center gap-2 border border-[#FF8C00] text-[#FF8C00] px-3 py-2 rounded-lg font-semibold hover:bg-[#FF8C00] hover:text-black transition"
                      >
                        <FaEdit /> Edit
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(p.product_id)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
