import React, { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Award,
  GraduationCap,
  Users,
  CheckCircle,
  X,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../axiosconfig";
import VideoCallPermissionModal from "../../components/VideoCallPermissionModal";

const DoctorDetailsPage = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [doctor, setDoctor] = useState({});
  const location = useLocation();
  const { id,rating } = location.state;
  useEffect(() => {
    fetchDoctor();
  }, []);

  async function fetchDoctor() {
    const response = await axiosInstance.get(
      `users/get_psycholgist_details/${id}`
    );
    setDoctor(response.data);
  }

  

  const handleStartCall = () => {
    console.log("Starting call...");
    setShowModal(false);
  };

  const handleVideoCall = () => {
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {doctor && (
        <>
          <div className="bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Doctor Image */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      doctor.profile_image || "/powerpoint-template-icons-b.jpg"
                    }
                    alt={doctor?.user?.name}
                    className="w-48 h-48 rounded-2xl object-cover shadow-lg"
                  />
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {doctor?.user?.name}
                      </h1>
                      <p className="text-xl text-blue-600 mb-3">
                        {doctor.specialization}
                      </p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-semibold">{parseFloat(rating).toFixed(1)}</span>
                          {/* <span className="text-gray-600">(120 reviews)</span> */}
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700">
                            {doctor.experience}
                          </span>
                        </div>
                        {/* <div className="flex items-center gap-1">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-700">200 patients</span>
                        </div> */}
                      </div>

                      {/* <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Kochi, Kerala</span>
                      </div> */}

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {doctor?.user?.email_address}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {doctor?.user?.mobile_number}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    About Dr.{" "}
                    {doctor.user?.name ? doctor.user.name.split(" ")[1] : ""}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {doctor.about_me}
                  </p>
                </div>

                {/* Education */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Education & Training
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">
                        {doctor.qualification}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Specializations */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    Specializations
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
                      {doctor.specialization}
                    </div>
                  </div>
                </div>

                {/* Fees */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    Consultation Fee
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{doctor.fees}
                    </span>
                    <span className="text-gray-600">per consultation</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Book */}
                {doctor.is_available && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Consultation</h3>
                    <div className="space-y-4">
                      <button
                        onClick={handleVideoCall}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        Consult Now
                      </button>
                    </div>
                  </div>
                )}
                {/* Conditionally render modal here */}
                {showModal && (
                  <VideoCallPermissionModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onStartCall={handleStartCall}
                    doctor={{
                      id : id,
                      name: doctor.user?.name ,
                      fees: doctor?.fees,
                      image:doctor?.profile_image,
                    }}
                    
                  />
                )}
                {/* Languages */}
                {/* <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    Languages Spoken
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      English
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      Malayalam
                    </span>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorDetailsPage;
