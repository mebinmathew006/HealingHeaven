import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VideoCallPermissionModal from "../../components/VideoCallPermissionModal";
import { toast } from "react-toastify";
import { getPsycholgistDetailsRoute } from "../../services/userService";

const UserBookingFromChat = () => {
  const [doctor, setDoctor] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId } = location.state || {};

  useEffect(() => {
   
      fetchDoctor();
    
  }, [doctorId]);

  async function fetchDoctor() {
    try {
      const response = await getPsycholgistDetailsRoute(doctorId);
      setDoctor(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      setLoading(false);
      toast.error('unable to load Doctor Details',{position:'bottom-center'})
    }
  }

  const handleStartCall = () => {
    console.log("Starting call...");
    // Add your call logic here
  };

  const handleCloseModal = () => {
    // Navigate back when modal is closed
    // navigate(-1);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {doctor && doctor.user && (
        <VideoCallPermissionModal
          isOpen={true}
          onClose={handleCloseModal}
          onStartCall={handleStartCall}
          doctor={{
            id: doctorId,
            name: doctor.user?.name,
            fees: doctor?.fees,
            image: doctor?.profile_image,
          }}
        />
      )}
    </div>
  );
};

export default UserBookingFromChat;