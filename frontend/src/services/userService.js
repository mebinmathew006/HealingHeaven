import axiosInstance from "../axiosconfig";

export const fetchDoctorImagesDisplay = async () => {
  const response = await axiosInstance.get(`/users/doctor_profile_images`);
  return response.data;
};

export const psychologistProfileImageRoute = async (
  userId,
  profileFormData
) => {
  const response = await axiosInstance.patch(
    `users/update_psychologist_profile_image/${userId}`,
    profileFormData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};

export const updateAvailabilityRoute = async (userId, isAvailable) => {
  
  const response = await axiosInstance.patch(
    `/users/psychologists/${userId}/availability`,
    { is_available: !isAvailable }
  );
  return response;
};
