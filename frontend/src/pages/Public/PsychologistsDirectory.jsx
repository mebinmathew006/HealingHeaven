import React,{ useEffect, useState } from "react";
import axiosInstance from "../../axiosconfig";
import { useSelector } from "react-redux";
import { Clock, CheckCircle, XCircle, Calendar,SquareUser } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const PsychologistCard = ({ id,name, specialty,availability, imageSrc ,rating}) => {
  const userId = useSelector((state)=>state.userDetails.id)
  const navigate = useNavigate()
  return (
    <div className=" rounded-lg shadow-2xl p-4 flex flex-col items-center">
        <div className="mb-3">

      {availability ? (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-blue-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Available Now</span>
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <Clock className="w-3 h-3" />
            <span className="text-xs">Ready for consultation</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Unavailable Now</span>
          </div>
          <div className="flex items-center space-x-1 text-red-600">
            <Calendar className="w-3 h-3" />
            <span className="text-xs">Please check back later</span>
          </div>
        </div>
      )}
    </div>


      <div className="w-full h-fit mb-4 overflow-hidden">
        <img
          src={imageSrc || '/powerpoint-template-icons-b.jpg'  }
          className = "h-50 w-100 rounded-4xl"
          alt={<SquareUser/>}
        />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-600 mb-3">{specialty}</p>
        <button className="bg-green-800 text-white px-6 py-1 rounded-full text-sm"  onClick={()=>userId ? navigate('/user_view_psychologist_details',{ state: { id,rating } }) : navigate('/public_view_psychologist_details',{ state: { id,rating } })}>
          More
        </button>
      </div>
    </div>
  );
};

export default function PsychologistsDirectory() {
  const userDetails = useSelector((state) => state.userDetails);
  const [psychologists, setpsychologists] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    getpsychos();
  }, []);

  const getpsychos = async () => {
    try {
      const response = await axiosInstance.get("users/view_psychologist");
      
      setpsychologists(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen mx-auto p-6 bg-gradient-to-br from-blue-50  to-green-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Explore Our Licensed Psychologists
        </h1>

        {!userDetails.name ? (
          <button 
          onClick={()=>navigate('/signup')}
          className="bg-green-800 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
            Register as a Psychologist
          </button>
        ) : (
          <div></div>
        )}
      </div>

      <p className="text-gray-700 mb-8 max-w-4xl">
        Our team of licensed psychologists is dedicated to providing
        personalized mental health support. Each therapist brings unique
        expertise and a compassionate approach to help you on your journey to
        better mental health.
      </p>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {psychologists && psychologists.length > 0 ? (
    psychologists.map((psych) => (
      <PsychologistCard
        key={psych.id}
        id={psych.user.id}
        rating={psych.rating}
        name={psych.user.name}
        specialty={psych.specialization}
        availability={psych.is_available}
        imageSrc={psych.profile_image}
      />
    ))
  ) : (
    <p>No Psychologists available</p>
  )}
</div>

    </div>
  );
}
