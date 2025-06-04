import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Shield, Bell, LineChart as ChartLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Home = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('home.hero_title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('home.hero_subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('home.get_started')}
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              {t('home.sign_in')}
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('home.features_title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <Pill size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.feature_medication')}
              </h3>
              <p className="text-gray-600">
                {t('home.feature_medication_desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <Bell size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.feature_reminders')}
              </h3>
              <p className="text-gray-600">
                {t('home.feature_reminders_desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <ChartLine size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.feature_analytics')}
              </h3>
              <p className="text-gray-600">
                {t('home.feature_analytics_desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.feature_secure')}
              </h3>
              <p className="text-gray-600">
                {t('home.feature_secure_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('home.cta_title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('home.cta_subtitle')}
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            {t('home.cta_button')}
          </Link>
        </div>
      </div>
    </div>
  );
};