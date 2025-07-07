import axiosInstance from "../axiosconfig"



export const fetchDoctorImagesDisplay = async()=>{
const response = await axiosInstance.get(
        `/users/doctor_profile_images`
      );
      return response.data
}