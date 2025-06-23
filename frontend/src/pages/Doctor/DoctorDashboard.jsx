import React, { useState, useEffect } from "react";
import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react";
import DoctorSidebar from "../../components/DoctorSidebar";
import Dashboard from "../Public/Dashboard";
import axios from "axios";
import axiosInstance from "../../axiosconfig";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";



const DoctorDashboard = () => {
  const doctorId = useSelector((state)=>state.userDetails.id)
  const [activeSection] = useState("doctor_dashboard");
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 140000,
    totalSessions: 70,
    totalPatients: 21,
    doctorsCount: 1245,
    patientsCount: 1356,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with actual API calls
       const response = await axiosInstance.get(`/consultations/doctor_dashboard_details/${doctorId}`)
       
        setChartData(response.data.chart_data);
        setEarningsData({totalEarnings:response.data.totalEarnings, totalSessions:response.data.totalSessions,totalPatients:response.data.totalPatients});
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
        <DoctorSidebar activeSection={activeSection} />
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
          type = 'doctor'
        />
      </div>
    </div>
  );
};

export default DoctorDashboard;
