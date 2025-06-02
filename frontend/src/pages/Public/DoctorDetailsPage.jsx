import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, Star, Award, GraduationCap, Users, CheckCircle, X } from 'lucide-react';

const DoctorDetailsPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    reason: ''
  });

  const doctor = {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    rating: 4.8,
    reviews: 248,
    experience: "15+ years",
    patients: "2,500+",
    education: [
      "MD - Harvard Medical School",
      "Residency - Johns Hopkins Hospital",
      "Fellowship - Mayo Clinic"
    ],
    specializations: [
      "Interventional Cardiology",
      "Heart Disease Prevention",
      "Cardiac Catheterization",
      "Preventive Cardiology"
    ],
    languages: ["English", "Spanish", "French"],
    about: "Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating complex cardiovascular conditions. She specializes in minimally invasive procedures and has pioneered several innovative techniques in interventional cardiology. Dr. Johnson is committed to providing personalized care and works closely with patients to develop comprehensive treatment plans.",
    location: "Heart Care Medical Center, New York, NY",
    contact: {
      phone: "(555) 123-4567",
      email: "dr.johnson@heartcare.com"
    },
    availableDates: [
      "2024-12-20",
      "2024-12-21", 
      "2024-12-23",
      "2024-12-27",
      "2024-12-28"
    ],
    timeSlots: [
      "09:00 AM", "10:00 AM", "11:00 AM", 
      "02:00 PM", "03:00 PM", "04:00 PM"
    ],
    achievements: [
      "Top Doctor Award 2023",
      "Excellence in Patient Care",
      "Research Publication Award"
    ]
  };

  const handleBooking = () => {
    if (selectedDate && selectedTime && patientInfo.name && patientInfo.email && patientInfo.phone) {
      setBookingConfirmed(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingConfirmed(false);
        setSelectedDate('');
        setSelectedTime('');
        setPatientInfo({ name: '', email: '', phone: '', reason: '' });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Doctor Image */}
            <div className="flex-shrink-0">
              <img 
                src={doctor.image} 
                alt={doctor.name}
                className="w-48 h-48 rounded-2xl object-cover shadow-lg"
              />
            </div>
            
            {/* Doctor Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                  <p className="text-xl text-blue-600 mb-3">{doctor.specialty}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold">{doctor.rating}</span>
                      <span className="text-gray-600">({doctor.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{doctor.experience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">{doctor.patients} treated</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{doctor.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{doctor.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{doctor.contact.email}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowBookingModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                >
                  Book Appointment
                </button>
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
              <h3 className="text-xl font-semibold mb-4">About Dr. {doctor.name.split(' ')[1]}</h3>
              <p className="text-gray-700 leading-relaxed">{doctor.about}</p>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Education & Training
              </h3>
              <ul className="space-y-2">
                {doctor.education.map((edu, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{edu}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Specializations</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {doctor.specializations.map((spec, index) => (
                  <div key={index} className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
                    {spec}
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Awards & Recognition</h3>
              <div className="space-y-3">
                {doctor.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Book */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Quick Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <select 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a date</option>
                    {doctor.availableDates.map(date => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {doctor.timeSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            selectedTime === time 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => setShowBookingModal(true)}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Languages Spoken</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((lang, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            {!bookingConfirmed ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Book Appointment</h3>
                  <button 
                    onClick={() => setShowBookingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Date:</strong> {selectedDate && new Date(selectedDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Time:</strong> {selectedTime}
                    </p>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={patientInfo.email}
                    onChange={(e) => setPatientInfo({...patientInfo, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={patientInfo.phone}
                    onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <textarea
                    placeholder="Reason for visit (optional)"
                    value={patientInfo.reason}
                    onChange={(e) => setPatientInfo({...patientInfo, reason: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  />
                  
                  <button 
                    onClick={handleBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600 mb-4">
                  Your appointment with Dr. {doctor.name.split(' ')[1]} has been scheduled for {new Date(selectedDate).toLocaleDateString()} at {selectedTime}.
                </p>
                <p className="text-sm text-gray-500">
                  A confirmation email will be sent to {patientInfo.email}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetailsPage;