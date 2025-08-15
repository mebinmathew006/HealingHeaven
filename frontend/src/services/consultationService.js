import axiosInstance from "../axiosconfig";

export const consultationDetailsUser = async (userId, page, limit) => {
  const response = await axiosInstance.get(
    `/consultations/get_consultation_for_user/${userId}?page=${page}&limit=${limit}`
  );
  return response;
};

export const addFeedback = async (formData, consultation_id, user_id) => {
  const response = await axiosInstance.post("/consultations/add_feedback", {
    ...formData,
    consultation_id: consultation_id,
    user_id: user_id,
  });
  return response;
};

export const createVideoSig = async (roomId, userId) => {
  const response = await axiosInstance.post("/consultations/generate-token", {
    room_id: roomId,
    user_id: userId,
  });
  return response;
};
export const postRecording = async (formData) => {
  const response = await axiosInstance.post(
    "/consultations/recordings",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};
export const updateStatusConsultation = async (status, consultations_id) => {
  const response = await axiosInstance.put(
    `/consultations/update_consultation_status/${status}/${consultations_id}`
  );
  return response;
};
export const getCompliantConsultation = async (consultations_id) => {
  const response = await axiosInstance.get(
    `/consultations/get_compliant_consultation/${consultations_id}`
  );
  return response.data;
};
export const CreateConsultaionRoute = async (data) => {
  const response = await axiosInstance.post(
    "/consultations/create_consultation",
    data
  );
  return response;
};
export const getCompliantsRoute = async (page, limit) => {
  const response = await axiosInstance.get(
    `/consultations/get_compliants?page=${page}&limit=${limit}`
  );
  return response.data;
};
export const updateComplaintsRoute = async (id, editingStatus) => {
  const response = await axiosInstance.patch(
    `/consultations/update_complaints/${id}`,
    { editingStatus }
  );

  return response;
};
export const getConsultationRoute = async (queryParams) => {
  const response = await axiosInstance.get(
    `/consultations/get_consultation?${queryParams}`
  );

  return response.data;
};
export const getAllNotificationsRoute = async () => {
  const response = await axiosInstance.get(
    "/consultations/get_all_notifications"
  );

  return response.data;
};
export const createNewNotificationRoute = async (formData) => {
  const response = await axiosInstance.post(
    "/consultations/create_new_notification",
    formData
  );

  return response;
};
export const adminDashboardDetailsRoute = async (selectedYear) => {
  const response = await axiosInstance.get(
    `/consultations/admin_dashboard_details/${selectedYear}`
  );

  return response;
};
export const doctorDashboardDetailsRoute = async (doctorId, selectedYear) => {
  const response = await axiosInstance.get(
    `/consultations/doctor_dashboard_details/${doctorId}/${selectedYear}`
  );
  return response;
};

export const setAnalysisFromDoctorRoute = async (
  formData,
  consultationId,
  callDuration
) => {
  const response = await axiosInstance.put(
    "/consultations/set_analysis_from_doctor",
    {
      ...formData,
      consultation_id: consultationId,
      duration: callDuration,
    }
  );
  return response;
};
export const doctorGetConsulationsRoute = async (
  doctorId,
  page,
  limit,
  orderingParam
) => {
  const response = await axiosInstance.get(
    `/consultations/doctor_get_consulations/${doctorId}?page=${page}&limit=${limit}&ordering=${orderingParam}`
  );
  return response;
};
export const getFeedbacksRoute = async (doctorId) => {
  const response = await axiosInstance.get(
    `/consultations/get_feedbacks/${doctorId}`
  );
  return response;
};
export const registerComplaintRoute = async (complaintData, consultationId) => {
  const response = await axiosInstance.post(
    "/consultations/register_complaint",
    {
      ...complaintData,
      consultation_id: consultationId,
    }
  );
  return response;
};
export const getComplaintsRoute = async (userId) => {
  const response = await axiosInstance.get(
    `/consultations/get_complaints/${userId}`
  );

  return response;
};
export const getNotificationsRoute = async (page, limit) => {
  const response = await axiosInstance.get(
    `/consultations/get_notifications/?page=${page}&limit=${limit}`
  );

  return response;
};
