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
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Download,
  ChevronDown,
} from "lucide-react";

const Dashboard = ({ chartData = [], earningsData = {}, type }) => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const currentEarningsData = earningsData;
  const currentChartData = chartData;

  // Generate year options (current year and 4 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

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
  }, [selectedYear]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const downloadReport = () => {
    const reportData = {
      year: selectedYear,
      totalEarnings: currentEarningsData.totalEarnings,
      totalSessions: currentEarningsData.totalSessions,
      totalPatients: currentEarningsData.totalPatients,
      averagePerSession: (
        currentEarningsData.totalEarnings / currentEarningsData.totalSessions
      ).toFixed(2),
      sessionsPerPatient: (
        currentEarningsData.totalSessions / currentEarningsData.totalPatients
      ).toFixed(1),
      monthlyAverage: (currentEarningsData.totalEarnings / 12).toFixed(2),
      monthlyData: currentChartData,
    };

    // Create PDF content using HTML and CSS
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Revenue Report - ${selectedYear}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 16px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }
          .stat-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #e8edff 100%);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #4F46E5;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .stat-card h3 {
            margin: 0 0 10px 0;
            color: #4F46E5;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .stat-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin: 0;
          }
          .monthly-section {
            margin-top: 40px;
          }
          .section-title {
            color: #4F46E5;
            font-size: 20px;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
          }
          .monthly-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .month-card {
            background: #fff;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            text-align: center;
          }
          .month-card .month {
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 5px;
          }
          .month-card .earnings {
            font-size: 18px;
            color: #1a1a1a;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { margin: 20px; }
            .stat-card { break-inside: avoid; }
            .month-card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Revenue Report</h1>
          <p>Annual Summary for ${selectedYear}</p>
          <p>Generated on ${new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
        </div>

        <div class="summary-grid">
          <div class="stat-card">
            <h3>Total Earnings</h3>
            <p class="value">${formatCurrency(reportData.totalEarnings)}</p>
          </div>
          <div class="stat-card">
            <h3>Total Sessions</h3>
            <p class="value">${reportData.totalSessions}</p>
          </div>
          <div class="stat-card">
            <h3>Total Patients</h3>
            <p class="value">${reportData.totalPatients}</p>
          </div>
          <div class="stat-card">
            <h3>Average per Session</h3>
            <p class="value">${formatCurrency(reportData.averagePerSession)}</p>
          </div>
          <div class="stat-card">
            <h3>Sessions per Patient</h3>
            <p class="value">${reportData.sessionsPerPatient}</p>
          </div>
          <div class="stat-card">
            <h3>Monthly Average</h3>
            <p class="value">${formatCurrency(reportData.monthlyAverage)}</p>
          </div>
        </div>

        <div class="monthly-section">
          <h2 class="section-title">Monthly Breakdown</h2>
          <div class="monthly-grid">
            ${currentChartData
              .map(
                (item) => `
              <div class="month-card">
                <div class="month">${item.month}</div>
                <div class="earnings">₹${item.earnings}L</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="footer">
          <p>This report was automatically generated from the Revenue Dashboard</p>
          <p>For questions or support, please contact your system administrator</p>
        </div>
      </body>
      </html>
    `;

    // Create and download PDF
    const blob = new Blob([pdfContent], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `revenue_report_${selectedYear}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Alternative: Open in new window for printing to PDF
    const printWindow = window.open("", "_blank");
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.focus();

    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 1000);
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
    <div className="flex-1 ms-2 me-2 mb-2 bg-gray-50 overflow-auto">
      {/* Header with Year Selection and Download */}
      <div className="flex justify-between items-center mb-8 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          {/* Year Selector */}
          <div className="relative">
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              {selectedYear}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showYearDropdown && (
              <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setShowYearDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      year === selectedYear
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-4 mb-8">
        <StatCard
          title="Total Earnings"
          value={currentEarningsData.totalEarnings}
          bgColor="bg-gradient-to-r from-red-300 to-pink-300"
          textColor="text-red-900"
          icon={DollarSign}
        />
        <StatCard
          title="Total Sessions"
          value={currentEarningsData.totalSessions}
          bgColor="bg-gradient-to-r from-blue-300 to-cyan-300"
          textColor="text-blue-900"
          icon={Calendar}
        />
        <StatCard
          title="Total Patients"
          value={currentEarningsData.totalPatients}
          bgColor="bg-gradient-to-r from-yellow-300 to-orange-300"
          textColor="text-orange-900"
          icon={Users}
        />
      </div>

      {/* Statistics Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Statistics - {selectedYear}
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F87171]"></div>
              <span className="text-sm text-gray-600">Income</span>
              <span className="text-sm font-semibold text-gray-900">
                {currentEarningsData.doctorsCount}
              </span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={currentChartData}
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
                dataKey="earnings"
                stroke="#F87171"
                strokeWidth={3}
                dot={{ fill: "#F87171", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#F87171", strokeWidth: 2 }}
                fill="url(#earningsGradient)"
              />

              <defs>
                <linearGradient
                  id="earningsGradient"
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
                  currentEarningsData.totalEarnings /
                    currentEarningsData.totalSessions
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
                  currentEarningsData.totalSessions /
                  currentEarningsData.totalPatients
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
                {formatCurrency(currentEarningsData.totalEarnings / 12)}
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
