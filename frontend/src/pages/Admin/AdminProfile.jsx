import React, { useState, useEffect } from "react";
import Dashboard from "../Public/Dashboard";
import AdminSidebar from "../../components/AdminSidebar";
import { adminDashboardDetailsRoute } from "../../services/consultationService";

const AdminProfile = () => {
  const [activeSection] = useState("admin_dashboard");
  const [earningsData, setEarningsData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  console.log(selectedYear)
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await adminDashboardDetailsRoute(selectedYear);
        const serverChartData = response.data.chart_data; 
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const graphData = months.map((month) => {
          const match = serverChartData.find((item) => item.month === month);
          return match || { month, earnings: 0 };
        });
        setChartData(graphData);
        setEarningsData({
          totalEarnings: response.data.totalEarnings,
          totalSessions: response.data.totalSessions,
          totalPatients: response.data.totalPatients,
        });
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

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
      <AdminSidebar activeSection={activeSection} />
      <Dashboard
        chartData={chartData}
        earningsData={earningsData}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />
    </div>
  );
};

export default AdminProfile;
