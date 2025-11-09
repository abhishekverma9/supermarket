import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

const OwnerProducts = () => {
  const { products, fetchAllProducts, backendUrl, token } = useContext(AuthContext);

  const [editRow, setEditRow] = useState(null); // product_id being edited
  const [formData, setFormData] = useState({ value: "", description: "" });

  const handleEditClick = (p) => {
    setEditRow(p.product_id);
    setFormData({
      value: p.discount_value || 0,
      description: p.discount_desc || "",
    });
  };

  const handleCancel = () => {
    setEditRow(null);
    setFormData({ value: "", description: "" });
  };

  const handleSave = async (product_Id) => {
    try {
      const { data } = await axios.post(backendUrl + `/api/admin/update-discount/${product_Id}`, { value: formData.value, description: formData.description }, { headers: { token } });
      if (data.success) {
        toast.success(data.message)
        fetchAllProducts();
        setEditRow(null);
      }else{
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">All Products</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow table-fixed">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="px-4 py-2 w-16">ID</th>
              <th className="px-4 py-2 w-40">Name</th>
              <th className="px-4 py-2 w-32">Category</th>
              <th className="px-4 py-2 w-28">Price (₹)</th>
              <th className="px-4 py-2 w-24">Stock</th>
              <th className="px-4 py-2 w-28">Discount (%)</th>
              <th className="px-4 py-2 w-60">Desc</th>
              <th className="px-4 py-2 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.product_id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="px-4 h-14 py-2">{p.product_id}</td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.category}</td>
                <td className="px-4 py-2">₹{p.price}</td>
                <td className="px-4 py-2">{p.stock_quantity}</td>

                {/* Discount Value */}
                <td className="px-4 py-2 w-28">
                  {editRow === p.product_id ? (
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <span className="inline-block w-full">
                      {p.discount_value || 0}%
                    </span>
                  )}
                </td>

                {/* Discount Desc */}
                <td className="px-4 py-2 w-60">
                  {editRow === p.product_id ? (
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <span className="inline-block w-full">
                      {p.discount_desc || "No Offer"}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-2">
                  {editRow === p.product_id ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave(p.product_id)}
                        className="text-green-500 hover:text-green-700"
                        title="Save"
                      >
                        <FaSave size={18} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-500 hover:text-red-700"
                        title="Cancel"
                      >
                        <FaTimes size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick(p)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerProducts;
