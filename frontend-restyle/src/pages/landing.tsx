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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">MediTrack</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Take Control of Your{' '}
            <span className="text-primary">Medication Journey</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            MediTrack helps you stay on top of your medications with smart reminders,
            detailed analytics, and comprehensive tracking tools designed for better health outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to manage your medications effectively and improve your health outcomes.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Proven Results</h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of users who have improved their medication adherence with MediTrack.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Take the first step towards better medication adherence today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Pill className="h-6 w-6 text-primary" />
              <span className="font-semibold">MediTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MediTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}