import React from 'react'
import depression from '../../assets/depression.png'
import anxiety from '../../assets/anxiety.jpg'
import relation from '../../assets/relation.jpg'
import Stress from '../../assets/Stress.jpg'
function IndexPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-green-200 py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your journey to mental well being starts here</h2>
          <div className="mt-6 mb-12">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">Best Online Counselling and Therapy Consultation</h3>
            <p className="text-gray-700 max-w-2xl">
              HealingHaven provides the best online therapy and counseling consultation in India with a panel of expert clinical psychologists. Book consultation with our expert psychologists online anytime, anywhere for affordable solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="rounded-lg overflow-hidden mb-3 h-39 w-full bg-gray-200">

                <img src={depression} alt="Logo" />
              
              </div>
              <p className="text-center font-medium">Depression</p>
              <button className="mt-2 text-sm border border-gray-300 rounded-full px-3 py-1">Know More</button>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-lg overflow-hidden mb-3 h-39 w-full bg-gray-200">
                <img src={anxiety} alt="Logo" />
                {/* Image placeholder */}
              </div>
              <p className="text-center font-medium">Anxiety</p>
              <button className="mt-2 text-sm border border-gray-300 rounded-full px-3 py-1">Know More</button>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-lg overflow-hidden mb-3 h-39 w-full bg-gray-200">
                {/* Image placeholder */}
                <img src={relation} alt="Logo" />
              </div>
              <p className="text-center font-medium">Relationship Issues</p>
              <button className="mt-2 text-sm border border-gray-300 rounded-full px-3 py-1">Know More</button>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-lg overflow-hidden mb-3 h-39 w-full bg-gray-200">
                {/* Image placeholder */}
                <img src={Stress} alt="Logo" />
              </div>
              <p className="text-center font-medium">Stress Management</p>
              <button className="mt-2 text-sm border border-gray-300 rounded-full px-3 py-1">Know More</button>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button className="bg-blue-700 text-white px-6 py-2 rounded-md">
              Talk to Therapist Now
            </button>
          </div>
        </div>
      </section>

      {/* Therapists Section */}
      <section className="py-12 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <div className="grid grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white p-2 rounded-lg shadow-sm">
                    <div className="rounded-lg overflow-hidden mb-2 h-32 w-full bg-gray-200">
                      {/* Therapist image placeholder */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/3">
              <h3 className="text-xl font-bold mb-3">Consult Best Psychologists in India</h3>
              <p className="text-gray-700 mb-4">
                We have the best psychologists in India who are experts in their field. They are part of top psychologists in India.
                <span className="font-semibold block mt-2">30,000+ SATISFIED PATIENTS</span>
              </p>
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Certified & Experienced</h4>
                <p className="text-gray-700">
                  All our psychologists are certified and have years of experience in handling various mental health issues.
                </p>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-2">We assign a best psychologist as counselor to you</h4>
                <p className="text-gray-700">
                  We make sure you get the right help for your specific needs.
                </p>
              </div>
              <button className="bg-blue-700 text-white px-6 py-2 rounded-md">
                Book an Appointment
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-center text-xl font-bold mb-8">
            HealingHaven is the most preferred and trusted online counselling and therapy consultation platform in India
          </h3>
          <div className="flex justify-center space-x-12 md:space-x-24">
            <div className="text-center">
              <p className="text-2xl font-bold">8,000+</p>
              <p className="text-gray-600 text-sm">Consultations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">25+</p>
              <p className="text-gray-600 text-sm">Psychologists</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">25,000+</p>
              <p className="text-gray-600 text-sm">Happy Clients</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default IndexPage


