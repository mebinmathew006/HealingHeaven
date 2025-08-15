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
export const adminViewPsychologistRoute = async (page, limit, search) => {
  const response = await axiosInstance.get(
    `users/admin_view_psychologist?page=${page}&limit=${limit}&search=${search}`
  );
  return response.data;
};
export const toggleUserStatusRoute = async (userId) => {
  const response = await axiosInstance.patch(
    `/users/toggle_user_status/${userId}`
  );
  return response;
};
export const getPsycholgistDetailsRoute = async (userId) => {
  const response = await axiosInstance.get(
    `/users/get_psycholgist_details/${userId}`
  );
  return response.data;
};
export const changePsychologistVerificationRoute = async (userId, status) => {
  const response = await axiosInstance.patch(
    `/users/change_psychologist_verification/${userId}/${status}`
  );
  return response;
};
export const revokePsychologistVerificationRoute = async (
  userId,
  revokeReason,
  status
) => {
  const response = await axiosInstance.put(
    `/users/revoke_psychologist_verification/${(userId, revokeReason)}`,
    {
      reason: revokeReason.trim(),
      status: status,
    }
  );
  return response;
};
export const adminViewUsersRoute = async (page, limit, search) => {
  const response = await axiosInstance.get(
    `users/admin_view_users?page=${page}&limit=${limit}&search=${search}`
  );
  return response.data;
};
export const psychologistsAvailabilityRoute = async (userId) => {
  const response = await axiosInstance.patch(
    `/users/psychologists/${userId}/availability`
  );
  return response;
};
export const updatePsychologistDetailsRoute = async (userId, formData) => {
  const response = await axiosInstance.put(
    `/users/update_psychologist_details/${userId}`,
    formData
  );
  return response;
};
export const updatePsychologistDocumentsRoute = async (userId, formData) => {
  const response = await axiosInstance.patch(
    `/users/update_psychologist_documents/${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};
export const doctorVerificationUpdateRoute = async (userId, formPayload) => {
  const response = await axiosInstance.put(
    `users/doctor_verification_update/${userId}`,
    formPayload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};
export const doctorVerificationRoute = async (userId, formPayload) => {
  const response = await axiosInstance.post(
    `users/doctor_verification/${userId}`,
    formPayload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};
export const passwordResetRoute = async (email) => {
  const response = await publicaxiosconfig.post("/users/password-reset", {
    email: email,
  });
  return response;
};
export const googleLoginRoute = async (credential) => {
  const response = await publicaxiosconfig.post("/users/google-login", {
    credential: credential,
  });
  return response;
};
export const loginRoute = async (email, password) => {
  const response = await publicaxiosconfig.post("/users/login", {
    email: email,
    password: password,
  });
  return response;
};
export const emailVerificationRoute = async (otpValue, email) => {
  const response = await publicaxiosconfig.post("users/email-verification", {
    otp: otpValue,
    email: email,
  });
  return response;
};
export const verifyOtpRoute = async (email, password, otpValue) => {
  const response = await publicaxiosconfig.post(
    "/users/password-reset/verify-otp",
    { email: email, password: password, otp: otpValue }
  );
  return response;
};
export const getPsychologistsRoute = async (page, limit) => {
  const response = await axiosInstance.get(
    `users/psychologists?page=${page}&limit=${limit}`
  );
  return response;
};
export const signupRoute = async (formData) => {
  const response = await publicaxiosconfig.post("users/users", formData);
  return response;
};
export const updateUserProfileRoute = async (userId, formData) => {
  const response = await axiosInstance.put(`/users/users/${userId}`, formData);
  return response;
};
export const getUserDetailsRoute = async (userId) => {
  const response = await axiosInstance.get(`/users/get_user_details/${userId}`);
  return response.data;
};
export const updateUserProfileImageRoute = async (userId,profileFormData) => {
  const response = await axiosInstance.patch(
    `users/update_user_profile_image/${userId}`,
    profileFormData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};
