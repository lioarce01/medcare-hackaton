import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pill,
  Calendar,
  BarChart3,
  Bell,
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: <Pill className="h-6 w-6" />,
      title: 'Medication Management',
      description: 'Track all your medications with detailed schedules and dosage information.',
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Smart Reminders',
      description: 'Never miss a dose with customizable notifications and alerts.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Adherence Analytics',
      description: 'Visualize your medication adherence patterns with detailed charts.',
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Multi-Channel Alerts',
      description: 'Receive reminders via email, SMS, and push notifications.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Data Privacy',
      description: 'Your health data is encrypted and protected with enterprise-grade security.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Family Sharing',
      description: 'Share medication schedules with family members and caregivers.',
    },
  ];

  const benefits = [
    'Improve medication adherence by up to 85%',
    'Reduce medication errors and missed doses',
    'Better health outcomes through consistency',
    'Peace of mind for you and your family',
    'Comprehensive health data insights',
    'Healthcare provider collaboration tools',
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-info-light">
              <Pill className="h-8 w-8" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MediTrack
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-info-light">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="text-white shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-success-light text-sm font-medium mb-6">
              <CheckCircle className="h-4 w-4 mr-2" />
              Trusted by 10,000+ users worldwide
            </div>
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-8 leading-tight">
            Take Control of Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Medication Journey
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            MediTrack helps you stay on top of your medications with smart reminders,
            detailed analytics, and comprehensive tracking tools designed for better health outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-white text-white shadow-xl px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:bg-info-light px-8 py-4 text-lg">
              Watch Demo
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-xl bg-success-light">
              <div className="text-3xl font-bold mb-2">85%</div>
              <div className="text-sm opacity-90">Improved Adherence</div>
            </div>
            <div className="p-6 rounded-xl bg-info-light">
              <div className="text-3xl font-bold mb-2">10K+</div>
              <div className="text-sm opacity-90">Active Users</div>
            </div>
            <div className="p-6 rounded-xl bg-purple-light">
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-sm opacity-90">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-warning-light text-sm font-medium mb-6">
            <Pill className="h-4 w-4 mr-2" />
            Powerful Features
          </div>
          <h2 className="text-4xl font-bold mb-6">Everything You Need</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive tools to manage your medications effectively and improve your health outcomes.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const colors = [
              'bg-info-light',
              'bg-success-light',
              'bg-warning-light',
              'bg-purple-light',
              'bg-info-light',
              'bg-success-light'
            ];
            return (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-xl ${colors[index]} flex items-center justify-center mb-6 shadow-sm`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-success-light text-sm font-medium mb-6">
                <BarChart3 className="h-4 w-4 mr-2" />
                Proven Results
              </div>
              <h2 className="text-4xl font-bold mb-6">Why Choose MediTrack?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join thousands of users who have improved their medication adherence with MediTrack.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 rounded-xl bg-success-light hover:shadow-lg transition-all duration-300">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-base font-medium leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 rounded-3xl bg-purple-light text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Health?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Take the first step towards better medication adherence today. Join thousands of users who trust MediTrack.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-slate-50 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-8 text-sm opacity-75">
              ✓ No credit card required  ✓ 30-day free trial  ✓ Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-info-light">
                  <Pill className="h-6 w-6" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MediTrack
                </span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Empowering better health outcomes through smart medication management and adherence tracking.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 MediTrack. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">Made with ❤️ for better health</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}