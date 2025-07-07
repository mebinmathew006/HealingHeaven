import React, { useEffect, useState } from 'react'
import { Heart, Users, Award, ArrowRight, CheckCircle, Star, Calendar, Shield } from 'lucide-react'
import depression from '../../assets/depression.png'
import anxiety from '../../assets/anxiety.jpg'
import relation from '../../assets/relation.jpg'
import Stress from '../../assets/Stress.jpg'
import { useNavigate } from 'react-router-dom'
import { fetchDoctorImagesDisplay } from '../../services/userService'

function IndexPage() {
  const [doctorImages, setDoctorImages] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()

  const fetchDoctorImages = async () => {
    const result = await fetchDoctorImagesDisplay();
    console.error(result)
    setDoctorImages(result)
  }

  useEffect(() => {
    fetchDoctorImages();
    setIsVisible(true)
  }, [])

  const services = [
    {
      title: "Depression",
      description: "Professional support for overcoming depression",
      image: depression,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Anxiety",
      description: "Effective strategies for managing anxiety",
      image: anxiety,
      color: "from-teal-500 to-cyan-600"
    },
    {
      title: "Relationship Issues",
      description: "Guidance for healthier relationships",
      image: relation,
      color: "from-emerald-500 to-green-600"
    },
    {
      title: "Stress Management",
      description: "Tools and techniques for stress relief",
      image: Stress,
      color: "from-lime-500 to-green-600"
    }
  ]

  const stats = [
    { number: "8,000+", label: "Consultations", icon: Calendar },
    { number: "25+", label: "Expert Psychologists", icon: Users },
    { number: "25,000+", label: "Happy Clients", icon: Heart }
  ]

  const features = [
    "Licensed & Certified Therapists",
    "Confidential & Secure Sessions",
    "Flexible Scheduling",
    "Affordable Pricing"
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50  to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        
        <div className="relative z-10 px-6 md:px-12 lg:px-20 py-20 md:py-32">
          <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Trusted by 25,000+ clients</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent leading-tight">
              Your Journey to
              <span className="block text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                Mental Wellness
              </span>
              Starts Here
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              HealingHaven provides the best online therapy and counseling consultation in India with a panel of expert clinical psychologists. 
              Book consultation with our expert psychologists online anytime, anywhere for affordable solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
              onClick={()=>navigate('/signup')}
               className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
              onClick={()=>navigate('/aboutus')}
              
              className="bg-white/90 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200">
                Learn More
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Specialized Mental Health Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our expert therapists provide comprehensive support for various mental health challenges
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
                  <div className="relative overflow-hidden rounded-2xl mb-6 h-32 w-full">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  {/* <button className="text-green-600 font-semibold hover:text-green-700 transition-colors flex items-center gap-1 group-hover:gap-2">
                    Know More 
                    <ArrowRight className="w-4 h-4 transition-all duration-300" />
                  </button> */}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button 
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/therapists')}
            >
              Talk to Therapist Now
            </button>
          </div>
        </div>
      </section>

      {/* Therapists Section */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {doctorImages.map((image, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-1 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="relative overflow-hidden rounded-xl">
                        <img 
                          src={image || `/powerpoint-template-icons-b.jpg`} 
                          alt={`Therapist ${index + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  Consult Best Psychologists in India
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed mb-4">
                  We have the best psychologists in India who are experts in their field. They are part of top psychologists in India.
                </p>
                <p className="text-2xl font-semibold text-green-600 mb-6">30,000+ SATISFIED PATIENTS</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                  <h4 className="text-xl font-semibold text-gray-900">Certified & Experienced</h4>
                </div>
                <p className="text-gray-700">
                  All our psychologists are certified and have years of experience in handling various mental health issues.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">We assign a best psychologist as counselor to you</h4>
                    <p className="text-gray-600">We make sure you get the right help for your specific needs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-r from-gray-900 to-green-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              HealingHaven is the most preferred and trusted online counselling and therapy consultation platform in India
            </h3>
            <p className="text-xl text-green-100">
              Leading the way in accessible, professional mental health support
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h4 className="text-4xl md:text-5xl font-bold mb-2 text-white">{stat.number}</h4>
                  <p className="text-green-100 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
    
    </main>
  )
}

export default IndexPage