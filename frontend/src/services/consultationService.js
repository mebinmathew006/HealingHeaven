import axiosInstance from "../axiosconfig"

export const consultationDetailsUser =async (userId,page,limit)=>{
   const response = await axiosInstance.get(
        `/consultations/get_consultation_for_user/${userId}?page=${page}&limit=${limit}`
      );
      return response
}


export const addFeedback = async (formData,consultation_id,user_id)=>{
   const response = await axiosInstance.post(
          "/consultations/add_feedback",
          {
            ...formData,
            consultation_id: consultation_id,
            user_id: user_id,
          }
        );
      return response
}