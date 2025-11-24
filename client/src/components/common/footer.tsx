import { Link } from '@tanstack/react-router'
import { MapPin, Phone, Mail, Clock, Activity } from 'lucide-react'

const Footer = () => {
  return (
    <footer className='relative overflow-hidden bg-[#0f172b] text-white'>
      {/* Background Glow */}
      <div className='absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-transparent opacity-30 blur-3xl' />

      {/* Pattern Overlay */}
      <div className='bg-[url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"none\\" fill-rule=\\"evenodd\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"0.03\\"%3E%3Ccircle cx=\\"30\\" cy=\\"30\\" r=\\"1\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-10'></div>

      <div className='relative z-10 container mx-auto px-6 py-16'>
        <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3'>
          {/* Company Info */}
          <div>
            <div className='mb-6 flex items-center space-x-2'>
              <Activity className='h-7 w-7 text-white' />
              <span className='text-r2xl font-extrabold text-white'>
                PulsePoint
              </span>
            </div>
            <p className='mb-6 max-w-xs leading-relaxed text-gray-400'>
              Providing exceptional healthcare services with compassion and
              advanced medical technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='mb-5 text-lg font-semibold text-white'>
              Quick Links
            </h4>
            <ul className='space-y-3 text-gray-400'>
              {[
                { to: '/doctors', label: 'Our Doctors' },
                { to: '/about', label: 'About Us' },
                { to: '/services', label: 'Services' },
                { to: '/faq', label: 'FAQ' },
                { to: '/contact', label: 'Contact Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className='group relative flex items-center hover:text-blue-400'
                  >
                    <span className='absolute -left-3 h-1.5 w-1.5 rounded-full bg-blue-400 opacity-0 transition-all group-hover:opacity-100'></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className='mb-5 text-lg font-semibold text-white'>
              Contact Us
            </h4>
            <div className='space-y-4 text-gray-400'>
              <div className='flex items-start space-x-3'>
                <MapPin className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400' />
                <p>Kathmandu, Nepal</p>
              </div>
              <div className='flex items-start space-x-3'>
                <Phone className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400' />
                <a
                  href='tel:9810325922'
                  className='transition-colors hover:text-blue-400'
                >
                  9810325922
                </a>
              </div>
              <div className='flex items-start space-x-3'>
                <Mail className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400' />
                <p>info@pulsepoint.com</p>
              </div>
              <div className='flex items-start space-x-3'>
                <Clock className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400' />
                <p className='text-green-400'>Emergency 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-12 border-t border-white/10 pt-2'>
          <div className='flex flex-col items-center justify-center gap-4 text-sm text-gray-400 md:flex-row'>
            <div>© 2024 PulsePoint Healthcare. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
