import { useEffect, useState } from "react";
import React from "react";
import axiosInstance from "../../axiosconfig";
import { useSelector } from "react-redux";
import {SquareUser } from 'lucide-react'

const PsychologistCard = ({ name, specialty, imageSrc }) => {
  return (
    <div className="bg-white rounded-lg shadow-2xl p-4 flex flex-col items-center">

      <div className="w-full h-fit mb-4 overflow-hidden">
        <img
          src={imageSrc || '/powerpoint-template-icons-b.jpg'  }
          className = "h-fit"
          alt={<SquareUser/>}
        />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-600 mb-3">{specialty}</p>
        <button className="bg-blue-800 text-white px-6 py-1 rounded-full text-sm">
          More
        </button>
      </div>
    </div>
  );
};

export default function PsychologistsDirectory() {
  const userDetails = useSelector((state) => state.userDetails);
  const [psychologists, setpsychologists] = useState([]);
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
    <div className="max-w-6xl mx-auto p-6 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Explore Our Licensed Psychologists
        </h1>

        {!userDetails.name ? (
          <button className="bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium">
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

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {psychologists && psychologists.length > 0 ? (
    psychologists.map((psych) => (
      <PsychologistCard
        key={psych.id}
        name={psych.user.name}
        specialty={psych.specialization}
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
