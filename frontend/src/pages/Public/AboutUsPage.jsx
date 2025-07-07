import React from 'react';
import { Heart, Users, Star, Shield, Target, Compass } from 'lucide-react';

const AboutUsPage = () => {
  const offerings = [
    {
      icon: <Heart className="w-6 h-6 text-blue-600" />,
      title: "Personalized Support",
      description: "Tailored solutions to address unique mental health needs."
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Community Connection",
      description: "A safe and inclusive environment to foster support and understanding."
    },
    {
      icon: <Star className="w-6 h-6 text-blue-600" />,
      title: "Expert Guidance",
      description: "Insights from professionals dedicated to your well-being."
    }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Trust & Safety",
      description: "Building a secure foundation for healing and growth"
    },
    {
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Purposeful Care",
      description: "Every interaction is designed with intention and compassion"
    },
    {
      icon: <Compass className="w-8 h-8 text-orange-600" />,
      title: "Guided Journey",
      description: "Supporting you through every step of your transformation"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50  to-green-50">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            About Us
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Introduction */}
          <section className="text-center">
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              At HealingHaven, we are passionate about empowering individuals to lead healthier, more balanced lives by nurturing their mental well-being. 
              Founded on the principles of mindfulness, growth, and healing, our mission is to create a supportive space where everyone can embark on a journey 
              toward self-discovery and transformation.
            </p>
          </section>

          {/* Core Mission and Values */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Core Mission and Values
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              We aim to bridge the gap between mental health awareness and accessible, effective solutions. At HealingHaven, we believe that mental well-being 
              is the foundation for a fulfilling life, and we are dedicated to offering tools, resources, and support that help individuals thrive.
            </p>

            {/* Values Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* What We Offer */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              What We Offer
            </h2>
            
            <div className="space-y-8">
              {offerings.map((offering, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
                  <div className="flex-shrink-0 mt-1">
                    {offering.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {offering.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {offering.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Why Choose Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Choose MindHeal?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our holistic approach combines science-backed practices with a deep understanding of individual experiences. Whether you're seeking to manage 
              stress, overcome challenges, or unlock your potential, HealingHaven is here to guide you every step of the way.
            </p>
          </section>

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-green-900 to-green-700 rounded-2xl p-12 text-center text-white mt-16">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands who have transformed their lives through our supportive community and expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                Get Started Today
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                Learn More
              </button>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="bg-gray-50 rounded-2xl p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                <p className="text-gray-600">Lives Transformed</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <p className="text-gray-600">Licensed Therapists</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
                <p className="text-gray-600">Client Satisfaction</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;