// import React, { useEffect, useState } from "react";
// import {
//   Camera,
//   Save,
//   Edit3,
//   Phone,
//   Calendar,
// } from "lucide-react";
// import Sidebar from "../../components/Sidebar";
// import { useSelector } from "react-redux";
// import axiosInstance from "../../axiosconfig";

// const UserViewPshyco = () => {
// const [activeSection, setActiveSection] = useState("profile");

//   const [formData, setFormData] = useState({});
//   const [isEditing, setIsEditing] = useState(false);
//   const userId = useSelector((state) => state.userDetails.id);

//   useEffect(() => {
//     fetchUser();
//   }, [userId]);

//   const fetchUser = async () => {
//     try {
//       const response = await axiosInstance.get(
//         `/users/get_user_details/${userId}`
//       );
//       setFormData(response.data);
//       console.log(response.data);
      
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleInputChange = (e) => {  
//   const { name, value } = e.target;

//   // If the field is part of the nested `user` object
//   if (["name", "mobile_number", "email_address", "role"].includes(name)) {
//     setFormData((prev) => ({
//       ...prev,
//       user: {
//         ...prev.user,
//         [name]: value,
//       },
//     }));
//   } else {
//     // For top-level fields like gender, date_of_birth
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   }
// };

//   const handleSave = async () => {
//     try {
//     const response = await axiosInstance.put(`/users/update_user_details/${userId}`,formData)
//     console.log("Saving profile data:", formData);
//     setIsEditing(false);
//     } catch (error) {
//     }
//   };


//     return (
//       <div className="flex h-screen bg-gray-100">
//       <Sidebar
//         activeSection={activeSection}
        
//       />
//       <div className="flex-1 bg-gray-50 overflow-auto">
//       <div className="max-w-4xl mx-auto p-6">
//       <div className="space-y-8">
//         {/* Profile Header */}
//         {formData.user ? (
//           <div className="bg-white rounded-xl shadow-sm p-8">
//             <div className="flex items-start space-x-6">
//               <div className="relative">
//                 <div >
//                   <img src= {formData.profile_image} className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold" alt="Image" />
                 
//                 </div>
//                 <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
//                   <Camera className="w-4 h-4 text-gray-600" />
//                 </button>
//               </div>
//               <div className="flex-1">
//                 <div className="flex items-center justify-between">
//                   <div> </div>
//                   <button
//                     onClick={() => setIsEditing(!isEditing)}
//                     className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     <Edit3 className="w-4 h-4" />
//                     <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
//                   </button>
//                 </div>
                
//               </div>
//             </div>
//           </div>
//         ) : (
//           ""
//         )}

//         {/* Profile Details */}
//           {formData.user ? (
//           <div className="bg-white rounded-xl shadow-sm p-8">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6">
//               Personal Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Name
//                 </label>
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.user.name}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 ) : (
//                   <div className="flex items-center space-x-2 text-gray-900">
//                     <span>{formData.user.name}</span>
//                   </div>
//                 )}
//               </div>

              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Gender
//                 </label>
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     name="gender"
//                     value={formData.gender}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 ) : (
//                   <div className="flex items-center space-x-2 text-gray-900">
//                     <span>{formData.gender}</span>
//                   </div>
//                 )}
//               </div>

              

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone
//                 </label>
//                 {isEditing ? (
//                   <input
//                     type="tel"
//                     name="mobile_number"
//                     value={formData.user.mobile_number}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 ) : (
//                   <div className="flex items-center space-x-2 text-gray-900">
//                     <Phone className="w-4 h-4 text-gray-400" />
//                     <span>{formData.user.mobile_number}</span>
//                   </div>
//                 )}
//               </div>

              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Date of Birth
//                 </label>
//                 {isEditing ? (
//                   <input
//                     type="date"
//                     name="date_of_birth"
//                     value={formData.date_of_birth}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 ) : (
//                   <div className="flex items-center space-x-2 text-gray-900">
//                     <Calendar className="w-4 h-4 text-gray-400" />
//                     <span>
//                       {new Date(formData.date_of_birth).toLocaleDateString()}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>


//             {isEditing && (
//               <div className="mt-6 flex justify-end">
//                 <button
//                   onClick={handleSave}
//                   className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <Save className="w-4 h-4" />
//                   <span>Save Changes</span>
//                 </button>
//               </div>
//             )}
//           </div>
//           ) : (
//             ""
//           )}
//       </div>
//       </div>
//       </div>
//       </div>
//     );


  

 
// };

// export default UserViewPshyco