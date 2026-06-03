import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaStar, FaEdit, FaSave, FaTimes, FaPhone } from "react-icons/fa";

const ConsumerProfile = () => {
  const { role, consumerProfile, updateConsumerProfile } = useContext(AuthContext);

  const [isEdit, setIsEdit] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Sync state with profile data
  useEffect(() => {
    if (consumerProfile) {
      setFirstName(consumerProfile.first_name || "");
      setLastName(consumerProfile.last_name || "");
      setPhone(consumerProfile.phone || "");
    }
  }, [consumerProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const success = await updateConsumerProfile({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
    });
    if (success) {
      setIsEdit(false);
    }
    setUpdating(false);
  };

  const handleCancel = () => {
    setIsEdit(false);
    if (consumerProfile) {
      setFirstName(consumerProfile.first_name || "");
      setLastName(consumerProfile.last_name || "");
      setPhone(consumerProfile.phone || "");
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40 outline-none transition-all";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-12 flex justify-center items-start text-[#f0f0f5]">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-orange-500 mb-2">My Profile</h2>
          <p className="text-gray-400">Manage your account details and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Avatar & Quick Stats */}
          <div className="md:col-span-1 space-y-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-2xl flex flex-col items-center text-center border border-white/5 shadow-xl"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-1 mb-4 shadow-[0_0_20px_rgba(255,140,0,0.3)]">
                <div className="w-full h-full rounded-full bg-[#1a1a2e] flex items-center justify-center overflow-hidden border-4 border-[#0a0a0f]">
                  <FaUser className="text-6xl text-gray-500 mt-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-100">
                {consumerProfile?.first_name || "Shopper"}
              </h3>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 capitalize">
                {role} Account
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-2xl border border-white/5 shadow-xl"
            >
              <h4 className="font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <FaStar className="text-orange-500" /> Rewards & Stats
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400 text-sm">Total Orders</span>
                  <span className="text-orange-400 font-bold">{consumerProfile?.orders_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Member Status</span>
                  <span className="text-gray-200 font-medium text-green-400">Active</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details Form */}
          <div className="md:col-span-2">
            <motion.div
              whileHover={{ y: -2 }}
              className="glass p-8 rounded-2xl border border-white/5 shadow-xl h-full"
            >
              {!isEdit ? (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                      <FaUser className="text-orange-500" /> Personal Information
                    </h3>
                    <button
                      onClick={() => setIsEdit(true)}
                      className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      <FaEdit /> Edit
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                          {consumerProfile?.first_name || "-"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                          {consumerProfile?.last_name || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center gap-3">
                          <FaEnvelope className="text-gray-500" />
                          {consumerProfile?.email || "-"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center gap-3">
                          <FaPhone className="text-gray-500" />
                          {consumerProfile?.phone || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                      <FaEdit className="text-orange-500" /> Edit Information
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed">
                          {consumerProfile?.email} (Cannot be changed)
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputClass}
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                      <motion.button
                        type="submit"
                        disabled={updating}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-2 transition-colors ${
                          updating ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <FaSave size={16} />
                        {updating ? "Saving..." : "Save Changes"}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleCancel}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <FaTimes size={16} />
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConsumerProfile;
