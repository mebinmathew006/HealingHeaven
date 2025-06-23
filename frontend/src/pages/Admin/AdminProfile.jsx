import React, { useState, useEffect } from "react";
import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react";
import DoctorSidebar from "../../components/DoctorSidebar";
import Dashboard from "../Public/Dashboard";
import AdminSidebar from "../../components/AdminSidebar";
import axiosInstance from "../../axiosconfig";

// Mock data for the chart
const generateChartData = () => [
  { month: "Jan", doctors: 2, patients: 3 },
  { month: "Feb", doctors: 8, patients: 4 },
  { month: "Mar", doctors: 6, patients: 5 },
  { month: "Apr", doctors: 3, patients: 2 },
  { month: "May", doctors: 1, patients: 1 },
  { month: "Jun", doctors: 5, patients: 4 },
  { month: "Jul", doctors: 4, patients: 3 },
  { month: "Aug", doctors: 2, patients: 2 },
  { month: "Sep", doctors: 7, patients: 6 },
  { month: "Oct", doctors: 9, patients: 8 },
  { month: "Nov", doctors: 5, patients: 7 },
  { month: "Dec", doctors: 4, patients: 5 },
];

const AdminProfile = () => {
  const [activeSection] = useState("admin_dashboard");
  const [earningsData, setEarningsData] = useState({
   });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true);
       const response = await axiosInstance.get(`/consultations/admin_dashboard_details`)
       
        setChartData(response.data.chart_data);
        setEarningsData(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div>
          <AdminSidebar activeSection={activeSection} />
        </div>
        <div className="flex-1 bg-gray-50 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="flex gap-4 mb-8">
                <div className="h-32 bg-gray-300 rounded-2xl flex-1"></div>
                <div className="h-32 bg-gray-300 rounded-2xl flex-1"></div>
                <div className="h-32 bg-gray-300 rounded-2xl flex-1"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
        <DoctorSidebar activeSection={activeSection} />
      <div>
        <Dashboard
           chartData={chartData}
          earningsData={earningsData}
          type = 'admin'
        />
      </div>
    </div>
  );
};

export default AdminProfile;
