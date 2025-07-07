import React, { useState } from "react";
import { ChevronDown, ChevronUp, Star, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ServicesPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const navigate = useNavigate()
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const processSteps = [
    {
      id: "browse",
      title: "Browse Therapists",
      description:
        "Discover how easy it is to connect with licensed therapists and schedule your sessions online with HealingHaven.",
      details:
        "Browse through our carefully vetted network of licensed mental health professionals. Filter by specialty, approach, availability, and more to find the perfect match for your needs.",
    },
    {
      id: "select",
      title: "Select your Therapist and Book Sessions",
      description:
        "Easily schedule your therapy sessions at your convenience. Once you book your session you can chat with your therapist and attend online session at scheduled time.",
      details:
        "Our intuitive booking system allows you to view real-time availability, select preferred time slots, and even have preliminary conversations with your chosen therapist before your first session.",
    },
    {
      id: "start",
      title: "Start Your Journey",
      description:
        "Begin your path to better mental health from the comfort of your home.",
      details:
        "Access secure video sessions, track your progress, set goals with your therapist, and engage in meaningful therapeutic work that fits seamlessly into your lifestyle.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Game Changer",
      content:
        "HealingHaven has been a game-changer for me. The convenience of online sessions made it easy to maintain consistency.",
      rating: 5,
      avatar: "SJ",
    },
    {
      name: "David Smith",
      title: "Amazing Platform",
      content:
        "I was skeptical about online therapy, but HealingHaven's platform and my therapist's support helped me tremendously.",
      rating: 5,
      avatar: "DS",
    },
    {
      name: "Emily Davis",
      title: "Highly Recommended",
      content:
        "The flexibility of scheduling sessions around my busy life made a huge difference. Highly recommend!",
      rating: 5,
      avatar: "ED",
    },
  ];

  const specialties = [
    {
      title: "Couples Issues",
      description: "Reignite love, rebuild connection. Expert couples therapy.",
      image: "👫",
    },
    {
      title: "Family Issues",
      description: "Reignite love, rebuild connection. Expert couples therapy.",
      image: "👨‍👩‍👧‍👦",
    },
    {
      title: "Individual Issues",
      description: "Reignite love, rebuild connection. Expert couples therapy.",
      image: "🙋‍♀️",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50  to-green-50 ">
      {/* Hero Section */}
      <div className=" py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Discover the path to a calmer you
          </h1>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            We offer a variety of services to support your mindfulness journey.
            Connect what best suits your needs.
          </p>

          {/* Specialty Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {specialties.map((specialty, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-6xl mb-6">{specialty.image}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {specialty.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {specialty.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className=" py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Our Process
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Discover how easy it is to connect with licensed therapists and
            schedule your sessions online with HealingHaven.
          </p>

          <div className="space-y-4">
            {processSteps.map((step, index) => (
              <div
                key={step.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(step.id)}
                  className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
                >
                  <span className="font-semibold text-gray-900">
                    {step.title}
                  </span>
                  {expandedSection === step.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedSection === step.id && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <p className="text-gray-700">{step.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={()=>navigate('/signup')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Client Experiences Section */}
      <div className=" py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Client Experiences
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center">
            Discover how HealingHaven has transformed lives through online
            therapy.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {testimonial.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {testimonial.content}
                </p>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {testimonial.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-green-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Take the first step towards better mental health today.
          </p>
          <button 
          onClick={()=>navigate('/signup')}
          className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
