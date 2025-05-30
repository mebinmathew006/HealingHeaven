import React, { useEffect, useState } from "react";

import AdminSidebar from "../../components/AdminSidebar";

const AdminProfile = () => {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} />
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-8">

          <h1>Admin Dashboard</h1>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
