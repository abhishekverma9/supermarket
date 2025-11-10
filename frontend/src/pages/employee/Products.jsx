import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const AddProduct = () => {
  const { backendUrl, token } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [expDate, setExpDate] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // ✅ Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Disable button

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("stock_quantity", stockQuantity);
      formData.append("exp_date", expDate);
      if (image) formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        // Reset form
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setStockQuantity("");
        setExpDate("");
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 rounded-2xl shadow-xl bg-white/70 dark:bg-slate-900/50 border border-amber-500/20 backdrop-blur-md">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 text-center mb-6">
        Add New Product
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-amber-500/30 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-amber-500/30 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-amber-500/30 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-amber-500/30 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
          required
        />
        <input
          type="number"
          placeholder="Stock Quantity"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-amber-500/30 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
          required
        />
        <input
          type="date"
          placeholder="Expiry Date"
          value={expDate}
          onChange={(e) => setExpDate(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-amber-500/30 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-amber-500/30 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
        />

        <button
          type="submit"
          className={`w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold shadow-md transition-transform hover:scale-[1.01] ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading} // ✅ Disable button while uploading
        >
          {loading ? "Uploading..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
