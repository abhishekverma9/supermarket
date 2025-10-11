import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaTrash, FaSave, FaEdit } from "react-icons/fa";

const Dashboard = () => {
  const { products, setProducts, updateProduct, deleteProduct, formatDate } = useContext(AuthContext);
  const [editStates, setEditStates] = useState({}); // Tracks which products are in edit mode

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

    // Only send price and stock_quantity
    updateProduct(product_id, {
      price: product.price,
      stock_quantity: product.stock_quantity,
    });

    handleToggleEdit(product_id); // exit edit mode
  };

  // Delete product
  const handleDelete = (product_id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(product_id);
    }
  };
  return (
    <div className="text-white p-6">
      <h2 className="text-2xl font-bold mb-4">Products Management</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Exp. Date</th>
              <th className="px-4 py-2">Discount</th>
              <th className="px-4 py-2">Desc.</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isEdit = editStates[p.product_id] || false;
              return (
                <tr key={p.product_id} className="border-b hover:bg-gray-600">
                  <td className="px-4 py-2">
                    <img
                      src={p.product_image}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.description}</td>
                  <td className="px-4 py-2">
                    {isEdit ? (
                      <input
                        type="number"
                        value={p.price}
                        onChange={(e) =>
                          handleLocalUpdate(p.product_id, "price", e.target.value)
                        }
                        className="w-20 px-2 py-1 border rounded text-black"
                      />
                    ) : (
                      p.price
                    )}₹
                  </td>
                  <td className="px-4 py-2">{p.category}</td>
                  <td className="px-4 py-2">
                    {isEdit ? (
                      <input
                        type="number"
                        value={p.stock_quantity}
                        onChange={(e) =>
                          handleLocalUpdate(p.product_id, "stock_quantity", e.target.value)
                        }
                        className="w-16 px-2 py-1 border rounded text-black"
                      />
                    ) : (
                      p.stock_quantity
                    )}
                  </td>
                  <td className="px-4 py-2">{formatDate(p.exp_date)}</td>
                  <td className="px-4 py-2">{p.discount_value ? p.discount_value : 0}%</td> {/* Always read-only */}
                  <td className="px-4 py-2">{p.discount_desc ? p.discount_desc : "-"}</td> {/* Always read-only */}
                  <td className="px-4 py-2 flex gap-2">
                    {isEdit ? (
                      <div
                        className="relative group cursor-pointer text-green-500 hover:text-green-600"
                        onClick={() => handleSave(p.product_id)}
                      >
                        <FaSave size={18} />
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                          Save
                        </span>
                      </div>
                    ) : (
                      <div
                        className="relative group cursor-pointer text-yellow-400 hover:text-yellow-300"
                        onClick={() => handleToggleEdit(p.product_id)}
                      >
                        <FaEdit size={18} />
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                          Edit
                        </span>
                      </div>
                    )}

                    <div
                      className="relative group cursor-pointer text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(p.product_id)}
                    >
                      <FaTrash size={18} />
                      <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                        Delete
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
