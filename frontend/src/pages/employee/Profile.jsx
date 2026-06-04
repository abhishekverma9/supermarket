import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaUserTie,
  FaImage,
  FaUsers,
  FaSpinner,
} from "react-icons/fa";

const EmpProfile = () => {
  const { backendUrl, token, role } = useContext(AuthContext);

  const [profile, setProfile] = useState({});
  const [team, setTeam] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const fetchProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/employee/profile`, {
        headers: { token },
      });
      if (data.success) {
        setProfile(data.employee);
        setFirstName(data.employee.first_name || "");
        setLastName(data.employee.last_name || "");
        setPhone(data.employee.phone || "");
        setPhotoPreview(data.employee.profile_photo || null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchTeam = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/employee/team-member`, {
        headers: { token },
      });
      if (data.success && Array.isArray(data.employees)) {
        setTeam(data.employees);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("phone", phone);
      if (photo) formData.append("profile_photo", photo);

      const { data } = await axios.post(
        `${backendUrl}/api/employee/update-profile`,
        formData,
        {
          headers: { token },
        } 
      );

      if (data.success) {
        toast.success("Profile updated successfully!");
        setIsEdit(false);
        fetchProfileData();
        setPhoto(null);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setIsEdit(false);
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setPhone(profile.phone || "");
    setPhoto(null);
    setPhotoPreview(profile.profile_photo || null);
  };

  useEffect(() => {
    if (token && role === "employee") {
      fetchProfileData();
      fetchTeam();
    }
  }, [token, role]);

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40 outline-none transition-all duration-200";

  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 text-center"
        >
          <h2 className="text-4xl font-extrabold mb-2 text-orange-500 drop-shadow-[0_0_10px_rgba(255,140,0,0.4)]">
            My Profile
          </h2>
          <p className="text-gray-400 text-lg">
            Manage your profile information and view your team
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#2E2E2E]/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30">
              {!isEdit ? (
                /* View Mode */
                <>
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                      <img
                        src={
                          photoPreview ||
                          profile.profile_photo ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-[#FF8C00] shadow-[0_0_20px_rgba(255,140,0,0.4)]"
                      />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-100 mb-2">
                      {profile.first_name} {profile.last_name}
                    </h2>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-[#FF8C00]/30 text-orange-500 mb-2">
                      <FaUserTie size={16} />
                      <span className="font-semibold">{profile.role || "Employee"}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#FF8C00]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <FaUser className="text-orange-500" />
                        <span className="text-gray-400 text-sm font-semibold">Full Name</span>
                      </div>
                      <p className="text-gray-100 text-lg">
                        {profile.first_name} {profile.last_name}
                      </p>
                    </div>

                    <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#FF8C00]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <FaEnvelope className="text-orange-500" />
                        <span className="text-gray-400 text-sm font-semibold">Email</span>
                      </div>
                      <p className="text-gray-100 text-lg">{profile.email}</p>
                    </div>

                    <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#FF8C00]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <FaPhone className="text-orange-500" />
                        <span className="text-gray-400 text-sm font-semibold">Phone</span>
                      </div>
                      <p className="text-gray-100 text-lg">
                        {profile.phone || "Not provided"}
                      </p>
                    </div>

                    {profile.created_at && (
                      <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#FF8C00]/20">
                        <div className="flex items-center gap-3 mb-2">
                          <FaCalendarAlt className="text-orange-500" />
                          <span className="text-gray-400 text-sm font-semibold">Joined</span>
                        </div>
                        <p className="text-gray-100 text-lg">
                          {new Date(profile.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <motion.button
                    onClick={() => setIsEdit(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-8 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaEdit size={18} />
                    Edit Profile
                  </motion.button>
                </>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      <img
                        src={
                          photoPreview ||
                          profile.profile_photo ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-[#FF8C00] shadow-[0_0_20px_rgba(255,140,0,0.4)]"
                      />
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <div className="px-4 py-2 rounded-lg bg-[#1e1e1e] border border-[#FF8C00]/30 hover:bg-[#2E2E2E] transition-colors flex items-center gap-2 text-gray-100">
                        <FaImage className="text-orange-500" />
                        <span>Change Photo</span>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                        placeholder="First Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="Phone Number"
                    />
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      disabled={updating}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-2 transition-colors ${
                        updating ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {updating ? (
                        <><FaSpinner className="animate-spin mr-2 inline" /> Saving...</>
                      ) : (
                        <><FaSave size={18} /> Save Changes</>
                      )}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleCancel}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <FaTimes size={18} />
                      Cancel
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

          {/* Team Members - Right Side */}
          {team.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="bg-[#2E2E2E]/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-[#FF8C00]/30">
                <h3 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-2">
                  <FaUsers className="text-orange-500" />
                  Team Members
                </h3>
                <div className="space-y-4">
                  {team.map((emp) => (
                    <motion.div
                      key={emp.employee_id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-[#1e1e1e] p-4 rounded-xl border border-[#FF8C00]/20"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={
                            emp.profile_photo ||
                            "https://via.placeholder.com/60"
                          }
                          alt={emp.first_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#FF8C00]"
                        />
                        <div>
                          <p className="font-semibold text-gray-100">
                            {emp.first_name} {emp.last_name}
                          </p>
                          <p className="text-sm text-orange-500">{emp.role}</p>
                        </div>
                      </div>
                      {emp.phone && (
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <FaPhone size={12} />
                          {emp.phone}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmpProfile;
