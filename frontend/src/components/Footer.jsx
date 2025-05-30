import React from 'react'
import { ChevronDown, Menu, X, Facebook, Twitter, Instagram } from 'lucide-react';
function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-green-700 font-bold text-xl mb-4">HealingHaven</h2>
            <div className="mt-4 space-y-2">
              <p>Home</p>
              <p>Services</p>
              <p>Therapists</p>
              <p>About Us</p>
              <p>Blog</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Terms and conditions</h4>
            <p className="text-gray-600 mb-4">Privacy Policy</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-600">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-400">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-600">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


