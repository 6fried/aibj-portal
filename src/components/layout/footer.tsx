import { AiesecLogo } from '@/components/ui/aiesec-logo'

export function Footer() {
  return (
    <footer className="border-t border-border bg-aiesec-light">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <AiesecLogo size="md" />
              <h3 className="font-semibold text-aiesec-dark">AIESEC in Benin</h3>
            </div>
            <p className="text-sm text-aiesec-dark/70">
              Developing leadership for a better world
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-aiesec-dark mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-aiesec-dark/70 hover:text-aiesec-blue">About</a></li>
              <li><a href="#" className="text-aiesec-dark/70 hover:text-aiesec-blue">Programs</a></li>
              <li><a href="#" className="text-aiesec-dark/70 hover:text-aiesec-blue">Events</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-aiesec-dark mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-aiesec-dark/70">Cotonou, Benin</li>
              <li className="text-aiesec-dark/70">contact@aiesec.org.bj</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-aiesec-dark mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-aiesec-blue hover:text-aiesec-blue/80">
                Facebook
              </a>
              <a href="#" className="text-aiesec-blue hover:text-aiesec-blue/80">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-aiesec-dark/70">
            © 2025 AIESEC in Benin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}