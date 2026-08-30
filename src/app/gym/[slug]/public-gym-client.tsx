'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GymThemeProvider, useGymTheme } from '@/components/gym-theme-provider'
import { formatCurrency, formatTime } from '@/lib/utils'
import { Dumbbell, Star, Users, Clock, MapPin, Phone, Mail, ArrowRight, Check } from 'lucide-react'

interface PublicGymPageClientProps {
  page: any
}

export function PublicGymPageClient({ page }: PublicGymPageClientProps) {
  const { gym, heroTitle, heroSubtitle, heroImageUrl, description, galleryImages, showClasses, showTrainers, showPlans, ctaText, ctaAction } = page
  const { theme } = useGymTheme()

  const primaryColor = gym.branding?.primaryColor || theme.primary
  const accentColor = gym.branding?.accentColor || theme.accent
  const backgroundColor = gym.branding?.backgroundColor || theme.background

  return (
    <GymThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: backgroundColor, color: theme.text }}>
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {heroImageUrl && (
            <div className="absolute inset-0 z-0">
              <img src={heroImageUrl} alt={gym.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          )}
          <div className="relative z-10 container mx-auto px-4 py-20 text-center">
            <div className="max-w-3xl mx-auto">
              <Dumbbell className="h-12 w-12 mx-auto mb-4" style={{ color: accentColor }} />
              <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: theme.text }}>
                {heroTitle || gym.name}
              </h1>
              {heroSubtitle && (
                <p className="text-xl md:text-2xl mb-8 text-gray-200">{heroSubtitle}</p>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-3 text-lg"
                  asChild
                  style={{ backgroundColor: accentColor, color: '#000' }}
                >
                  <Link href={`/auth/login?gym=${gym.slug}`}>
                    {ctaText || 'Get Started'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-3 text-lg"
                  asChild
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  <Link href={`/auth/login?gym=${gym.slug}`}>Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        {description && (
          <section className="py-20 container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: theme.text }}>About {gym.name}</h2>
            </div>
            <div className="prose max-w-3xl mx-auto" style={{ color: theme.text }}>
              <p className="text-lg text-gray-300">{description}</p>
            </div>
          </section>
        )}

        {/* Gallery */}
        {galleryImages && galleryImages.length > 0 && (
          <section className="py-20 container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {galleryImages.map((img: string, i: number) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden">
                    <img src={img} alt={`${gym.name} gallery`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Classes */}
        {showClasses && gym.classes && gym.classes.length > 0 && (
          <section className="py-20 container mx-auto px-4" style={{ backgroundColor: theme.surface }}>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.text }}>Our Classes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gym.classes.map((cls: any) => (
                  <Card key={cls.id} className="h-full" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cls.color || accentColor}20`, color: cls.color || accentColor }}>
                          <Dumbbell className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold" style={{ color: theme.text }}>{cls.name}</h3>
                          <p className="text-sm text-gray-400">{cls.category}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">{cls.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {cls.capacity} max</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {cls.durationMinutes} min</span>
                      </div>
                      {cls.schedules && cls.schedules.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-xs text-gray-500 mb-2">Weekly Schedule</p>
                          <div className="space-y-1">
                            {cls.schedules.slice(0, 3).map((sched: any) => (
                              <div key={sched.id} className="flex justify-between text-xs text-gray-400">
                                <span>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][sched.dayOfWeek]}</span>
                                <span>{formatTime(sched.startTime)} - {formatTime(sched.endTime)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trainers */}
        {showTrainers && gym.trainers && gym.trainers.length > 0 && (
          <section className="py-20 container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.text }}>Our Trainers</h2>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gym.trainers.map((trainer: any) => (
                  <Card key={trainer.id} className="text-center" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                    <CardContent className="p-6">
                      <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                        {trainer.firstName[0]}{trainer.lastName[0]}
                      </div>
                      <h3 className="font-bold" style={{ color: theme.text }}>{trainer.firstName} {trainer.lastName}</h3>
                      <p className="text-sm text-gray-400 mb-2">{trainer.specialties?.join(', ')}</p>
                      <p className="text-xs text-gray-500">{trainer.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Membership Plans */}
        {showPlans && gym.membershipPlans && gym.membershipPlans.length > 0 && (
          <section className="py-20 container mx-auto px-4" style={{ backgroundColor: theme.surface }}>
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.text }}>Membership Plans</h2>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gym.membershipPlans.map((plan: any) => (
                  <Card key={plan.id} className="relative" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                    {plan.discountPercent && plan.discountPercent > 0 && (
                      <Badge className="absolute -top-3 left-4" variant="success" style={{ backgroundColor: accentColor }}>
                        Save {plan.discountPercent}%
                      </Badge>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2" style={{ color: theme.text }}>{plan.name}</h3>
                      <p className="text-gray-400 mb-4">{plan.description}</p>
                      <div className="mb-4">
                        <span className="text-3xl font-bold" style={{ color: theme.text }}>{formatCurrency(plan.price, gym.currency)}</span>
                        <span className="text-gray-400"> / {plan.durationDays} days</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-gray-300"><Check className="h-4 w-4" style={{ color: accentColor }} /> Unlimited gym access</li>
                        {plan.classesIncluded && <li className="flex items-center gap-2 text-gray-300"><Check className="h-4 w-4" style={{ color: accentColor }} /> Classes included</li>}
                        {plan.personalTrainingIncluded && <li className="flex items-center gap-2 text-gray-300"><Check className="h-4 w-4" style={{ color: accentColor }} /> Personal training</li>}
                        <li className="flex items-center gap-2 text-gray-300"><Check className="h-4 w-4" style={{ color: accentColor }} /> {plan.freezeDaysAllowed} freeze days</li>
                      </ul>
                      <Button className="w-full" variant="outline" asChild style={{ borderColor: theme.border }}>
                        <Link href={`/auth/login?gym=${gym.slug}`}>Choose Plan</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact / Location */}
        <section className="py-20 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.text }}>Visit Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                <CardContent>
                  <MapPin className="h-8 w-8 mx-auto mb-3" style={{ color: accentColor }} />
                  <h3 className="font-bold mb-2" style={{ color: theme.text }}>Location</h3>
                  <p className="text-gray-300">{gym.address}, {gym.city}</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                <CardContent>
                  <Phone className="h-8 w-8 mx-auto mb-3" style={{ color: accentColor }} />
                  <h3 className="font-bold mb-2" style={{ color: theme.text }}>Phone</h3>
                  <p className="text-gray-300">{gym.phone}</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                <CardContent>
                  <Mail className="h-8 w-8 mx-auto mb-3" style={{ color: accentColor }} />
                  <h3 className="font-bold mb-2" style={{ color: theme.text }}>Email</h3>
                  <p className="text-gray-300">{gym.email}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
          <div className="container mx-auto px-4 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {gym.name}. All rights reserved.</p>
            <p className="mt-2 text-sm">Powered by <span style={{ color: accentColor }}>FITCORE</span></p>
          </div>
        </footer>
      </div>
    </GymThemeProvider>
  )
}