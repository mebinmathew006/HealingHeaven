import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react";



const Dashboard = ({chartData}) => {

  const [earningsData, setEarningsData] = useState({
    totalEarnings: 140000,
    totalSessions: 70,
    totalPatients: 21,
    doctorsCount: 1245,
    patientsCount: 1356,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, bgColor, textColor, icon: Icon }) => (
    <div className={`${bgColor} rounded-2xl p-6 flex-1 min-w-0`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} opacity-80`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${textColor} mt-1`}>
            {typeof value === "number" && title.includes("Earnings")
              ? formatCurrency(value)
              : value}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-white bg-opacity-20`}>
            <Icon className={`h-6 w-6 ${textColor}`} />
          </div>
        )}
      </div>
    </div>
  );

  

  return (
    
      <div className="flex-1 bg-gray-50 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4 mb-8">
          <StatCard
            title="Total Earnings"
            value={earningsData.totalEarnings}
            bgColor="bg-gradient-to-r from-red-300 to-pink-300"
            textColor="text-red-900"
            icon={DollarSign}
          />
          <StatCard
            title="Total Sessions"
            value={earningsData.totalSessions}
            bgColor="bg-gradient-to-r from-blue-300 to-cyan-300"
            textColor="text-blue-900"
            icon={Calendar}
          />
          <StatCard
            title="Total Patients"
            value={earningsData.totalPatients}
            bgColor="bg-gradient-to-r from-yellow-300 to-orange-300"
            textColor="text-orange-900"
            icon={Users}
          />
        </div>

        {/* Statistics Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Statics</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm text-gray-600">Doctors</span>
                <span className="text-sm font-semibold text-gray-900">
                  {earningsData.doctorsCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm text-gray-600">Patients</span>
                <span className="text-sm font-semibold text-gray-900">
                  {earningsData.patientsCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  domain={[0, 10]}
                />
                <Line
                  type="monotone"
                  dataKey="doctors"
                  stroke="#FCD34D"
                  strokeWidth={3}
                  dot={{ fill: "#FCD34D", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#FCD34D", strokeWidth: 2 }}
                  fill="url(#doctorsGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#F87171"
                  strokeWidth={3}
                  dot={{ fill: "#F87171", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#F87171", strokeWidth: 2 }}
                  fill="url(#patientsGradient)"
                />
                <defs>
                  <linearGradient
                    id="doctorsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FCD34D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="patientsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average per Session
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    earningsData.totalEarnings / earningsData.totalSessions
                  )}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Sessions per Patient
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {(
                    earningsData.totalSessions / earningsData.totalPatients
                  ).toFixed(1)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Average
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(earningsData.totalEarnings / 12)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
