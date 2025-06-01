import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Shield, Bell, LineChart as ChartLine } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Take Control of Your Medication Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track, manage, and stay on top of your medications with our comprehensive medication adherence system.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Features that Make a Difference
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <Pill size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Medication Management
              </h3>
              <p className="text-gray-600">
                Easily track and manage all your medications in one place with detailed information and scheduling.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <Bell size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Reminders
              </h3>
              <p className="text-gray-600">
                Never miss a dose with customizable reminders and notifications tailored to your schedule.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <ChartLine size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Adherence Analytics
              </h3>
              <p className="text-gray-600">
                Track your progress and identify patterns with detailed adherence reports and insights.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your health information is protected with industry-standard security and encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are managing their medications effectively.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            Start Your Journey
          </Link>
        </div>
      </div>
    </div>
  );
};