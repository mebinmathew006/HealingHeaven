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

export const createVideoSig = async (roomId,userId)=>{
   const response = await axiosInstance.post(
          "/consultations/generate-token",
          {
           room_id: roomId,
          user_id: userId
          }
        );
      return response
}
export const postRecording = async (formData)=>{
   const response = await axiosInstance.post(
          "/consultations/recordings",
          formData,
          {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
        );
      return response
}
export const updateStatusConsultation = async (status,consultations_id)=>{
   const response = await axiosInstance.put(
          `/consultations/update_consultation_status/${status}/${consultations_id}`
        );
      return response
}
