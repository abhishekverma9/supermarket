import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const EmpProfile = () => {
  const { backendUrl, token, role } = useContext(AuthContext);

  const [profile, setProfile] = useState({});
  const [team, setTeam] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [photo, setPhoto] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Fetch team members
  const fetchProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/employee/profile`, {
        headers: { token },
      });
      if (data.success) {
        console.log(data)
        setProfile(data.employee);
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

  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("phone", phone);
      if (photo) formData.append("profile_photo", photo);

      const { data } = await axios.put(`${backendUrl}/api/employee/profile/update`, formData, {
        headers: { token },
      });

      if (data.success) {
        toast.success("Profile updated successfully!");
        setIsEdit(false);
        fetchProfile();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    if (token && role === "employee") {
      fetchProfileData();
      fetchTeam()
    }
  }, [token, role]);

  return (
    // <div className="max-w-4xl mx-auto mt-10 px-4">
    //   {/* Profile Card */}
    //   <div className="relative bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-6 flex flex-col items-center text-center text-white transition-transform hover:scale-[1.01] duration-300">
    //     <div className="relative w-32 h-32 mb-4">
    //       <img
    //         src={photo ? URL.createObjectURL(photo) : profile.profile_photo || "https://via.placeholder.com/150"}
    //         alt="Profile"
    //         className="w-full h-full rounded-full object-cover shadow-2xl border-4 border-indigo-500"
    //       />
    //     </div>

    //     {isEdit ? (
    //       <form className="w-full space-y-4" onSubmit={handleUpdate}>
    //         <div className="flex flex-col md:flex-row gap-4">
    //           <input
    //             type="text"
    //             value={firstName}
    //             onChange={(e) => setFirstName(e.target.value)}
    //             className="w-full px-4 py-2 rounded-lg text-black focus:outline-indigo-500 focus:ring-1 focus:ring-indigo-500"
    //             placeholder="First Name"
    //             required
    //           />
    //           <input
    //             type="text"
    //             value={lastName}
    //             onChange={(e) => setLastName(e.target.value)}
    //             className="w-full px-4 py-2 rounded-lg text-black focus:outline-indigo-500 focus:ring-1 focus:ring-indigo-500"
    //             placeholder="Last Name"
    //             required
    //           />
    //         </div>
    //         <input
    //           type="text"
    //           value={phone}
    //           onChange={(e) => setPhone(e.target.value)}
    //           className="w-full px-4 py-2 rounded-lg text-black focus:outline-indigo-500 focus:ring-1 focus:ring-indigo-500"
    //           placeholder="Phone"
    //         />
    //         <input
    //           type="file"
    //           onChange={(e) => setPhoto(e.target.files[0])}
    //           className="text-sm text-gray-300 w-full"
    //         />
    //         <div className="flex justify-center gap-4">
    //           <button
    //             type="submit"
    //             disabled={updating}
    //             className={`px-6 py-2 bg-indigo-600 rounded-lg font-semibold transition hover:bg-indigo-700 ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
    //           >
    //             {updating ? "Updating..." : "Save"}
    //           </button>
    //           <button
    //             type="button"
    //             onClick={() => setIsEdit(false)}
    //             className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 font-semibold transition"
    //           >
    //             Cancel
    //           </button>
    //         </div>
    //       </form>
    //     ) : (
    //       <>
    //         <h2 className="text-2xl font-bold mb-1">{profile.first_name} {profile.last_name}</h2>
    //         <p className="text-sm text-indigo-400 font-medium mb-1">{profile.role}</p>
    //         <p className="text-sm text-gray-300 mb-1">{profile.phone || "N/A"}</p>
    //         <p className="text-xs text-gray-400 mb-4">Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
    //         <button
    //           onClick={() => setIsEdit(true)}
    //           className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition"
    //         >
    //           Edit Profile
    //         </button>
    //       </>
    //     )}
    //   </div>

    //   {/* Team Members */}
    //   {team.length > 0 && (
    //     <div className="mt-10">
    //       <h3 className="text-xl font-semibold mb-4 text-white">Team Members</h3>
    //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    //         {team.map((emp) => (
    //           <div key={emp.employee_id} className="bg-gray-800 rounded-2xl p-4 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition">
    //             <img
    //               src={emp.profile_photo || "https://via.placeholder.com/150"}
    //               alt={emp.first_name}
    //               className="w-20 h-20 rounded-full mb-2 object-cover border-2 border-indigo-500"
    //             />
    //             <p className="font-semibold text-white">{emp.first_name} {emp.last_name}</p>
    //             <p className="text-sm text-indigo-300">{emp.role}</p>
    //             <p className="text-sm text-gray-400">{emp.phone || "N/A"}</p>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   )}
    // </div>
    <div></div>
  );
};

export default EmpProfile;
