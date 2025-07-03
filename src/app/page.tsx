import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-aiesec-blue to-aiesec-teal text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to AIESEC in Benin Portal
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your gateway to leadership development, global opportunities, and making a positive impact in the world.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/join">Join AIESEC</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-aiesec-blue" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-aiesec-dark">
            What We Offer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-aiesec-gray">
              <CardHeader>
                <CardTitle className="text-aiesec-blue">Global Volunteer</CardTitle>
                <CardDescription>
                  Make a difference through volunteer projects worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-aiesec-dark/70">
                  Join impactful volunteer projects and contribute to the UN SDGs while developing your leadership skills.
                </p>
              </CardContent>
            </Card>

            <Card className="border-aiesec-gray">
              <CardHeader>
                <CardTitle className="text-aiesec-green">Global Talent</CardTitle>
                <CardDescription>
                  Professional internships around the globe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-aiesec-dark/70">
                  Gain professional experience through international internships and boost your career prospects.
                </p>
              </CardContent>
            </Card>

            <Card className="border-aiesec-gray">
              <CardHeader>
                <CardTitle className="text-aiesec-purple">Leadership Development</CardTitle>
                <CardDescription>
                  Build your leadership potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-aiesec-dark/70">
                  Develop essential leadership skills through practical experiences and comprehensive training programs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}