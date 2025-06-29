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
  Sparkles,
  Heart,
  Zap,
  Star,
} from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: <Pill className="h-6 w-6" />,
      title: 'Smart Medication Management',
      description: 'Keep track of all your medications with personalized schedules and detailed dosage information.',
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Gentle Reminders',
      description: 'Receive friendly notifications that help you stay on track with your medication schedule.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Insightful Analytics',
      description: 'Understand your medication patterns with clear, easy-to-read charts and progress tracking.',
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Flexible Notifications',
      description: 'Choose how you want to be reminded - email, SMS, or push notifications that work for you.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Your Privacy Matters',
      description: 'Your health information is protected with industry-standard security and encryption.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Family Support',
      description: 'Share your medication schedule with trusted family members or caregivers when needed.',
    },
  ];

  const benefits = [
    'Build better medication habits with gentle guidance',
    'Reduce the stress of managing multiple medications',
    'Feel more confident about your health routine',
    'Keep your loved ones informed about your progress',
    'Get insights that help you and your healthcare team',
    'Simple tools that fit into your daily life',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
              <Pill className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
              MedCare+
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-emerald-50/50 dark:from-emerald-950/20 dark:via-background dark:to-emerald-950/10"></div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-4 w-4 mr-2" />
                Designed for real people, real lives
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
              Your Health Journey{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              MedCare+ helps you manage your medications with care and simplicity.
              No overwhelming features, just the tools you need to feel confident about your health routine.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg px-8 py-4 text-lg font-semibold">
                  Start Your Tracking Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                <div className="text-2xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">Simple</div>
                <div className="text-sm text-muted-foreground">Easy to use, designed for everyone</div>
              </div>
              <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                <div className="text-2xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">Reliable</div>
                <div className="text-sm text-muted-foreground">Consistent reminders you can count on</div>
              </div>
              <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                <div className="text-2xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">Private</div>
                <div className="text-sm text-muted-foreground">Your health data stays with you</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 border border-emerald-200 dark:border-emerald-800">
            <Zap className="h-4 w-4 mr-2" />
            Thoughtful Features
          </div>
          <h2 className="text-4xl font-bold mb-6">Everything You Need, Nothing You Don't</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We've focused on the essentials that make medication management feel less overwhelming and more manageable.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-200 dark:border-emerald-800 bg-card">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-6 shadow-sm border border-emerald-200 dark:border-emerald-800">
                  <div className="text-emerald-600 dark:text-emerald-400">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-emerald-50/30 dark:bg-emerald-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 border border-emerald-200 dark:border-emerald-800">
                <Star className="h-4 w-4 mr-2" />
                Why People Choose MedCare+
              </div>
              <h2 className="text-4xl font-bold mb-6">Feel Better About Your Health Routine</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join others who have found a more peaceful way to manage their medications.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 rounded-xl bg-card border border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
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
          <div className="p-12 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-6">Ready to Feel More Confident?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Take the first step towards a more peaceful medication routine.
              Start your journey with MedCare+ today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-emerald-600 px-8 py-4 text-lg font-semibold">
                  Start Your Tracking Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 text-sm opacity-75">
              ✓ No credit card required  ✓ Free to start
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <Pill className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
                  MedCare+
                </span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Helping you manage your medications with care, simplicity, and peace of mind.
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
              © 2024 MedCare+. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">Made with <Heart className="inline h-4 w-4 text-red-500" /> for better health</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}