'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out PoseMan',
    features: [
      'Classic word-guessing mode',
      '2 free fitness routines',
      'Basic pose detection',
      'Local score tracking',
      'Limited daily games',
    ],
    limitations: [
      'No 1v1 battles',
      'No premium routines',
      'No leaderboards',
      'Ads enabled',
    ],
    cta: 'Current Plan',
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    description: 'Unlock the full PoseMan experience',
    features: [
      'Everything in Free',
      'Unlimited games',
      'All fitness routines (20+)',
      '1v1 real-time battles',
      'Global leaderboards',
      'Advanced pose analytics',
      'Custom challenges',
      'Priority matchmaking',
      'No ads',
      'Early access to new features',
    ],
    limitations: [],
    cta: 'Upgrade Now',
    highlighted: true,
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    price: '$39.99',
    period: '/year',
    description: 'Best value - save 33%',
    features: [
      'Everything in Premium',
      '2 months free',
      'Exclusive yearly badge',
      'Priority support',
    ],
    limitations: [],
    cta: 'Best Value',
    highlighted: false,
    badge: 'Save 33%',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="premium" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium Plans
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Unlock Your Full Potential
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your fitness journey. Upgrade anytime to access premium features.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`h-full relative ${
                  plan.highlighted
                    ? 'border-yellow-500 bg-gradient-to-b from-yellow-500/10 to-transparent'
                    : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="success">{plan.badge}</Badge>
                  </div>
                )}

                {plan.highlighted && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="premium">
                      <Crown className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.highlighted && <Crown className="w-5 h-5 text-yellow-500" />}
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-800">
                      {plan.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-start gap-2">
                          <span className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5 text-center">
                            —
                          </span>
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                        : ''
                    }`}
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    disabled={plan.id === 'free'}
                  >
                    {plan.id === 'free' ? (
                      plan.cta
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {plan.cta}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your subscription at any time. You will continue to have access to premium features until the end of your billing period.',
              },
              {
                q: 'Is there a free trial?',
                a: 'The free plan gives you access to core features forever. Try out PoseMan and upgrade when you are ready for more!',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and Apple Pay through our secure payment processor.',
              },
              {
                q: 'Can I switch between plans?',
                a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
              },
            ].map((faq) => (
              <Card key={faq.q} className="p-4">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <Button variant="outline">Contact Support</Button>
        </motion.div>
      </div>
    </div>
  );
}
