import Footer from '@/components/common/footer'
import Navigation from '@/components/common/nav'
import DiseasePredictionSection from './disease-prediction-section'
import FAQSection from './faq-section'
import HeroSection from './hero-section'
import MeetDoctorsSection from './meet-doctors-section'
import ServicesSection from './services-section'

const Home = () => {
  return (
    <div>
      <Navigation />
      <div className='relative z-30 w-full'>
        <HeroSection />
        <ServicesSection />
      </div>
      <DiseasePredictionSection />

      <MeetDoctorsSection />
      <div className='bg-white'>
        <FAQSection />
      </div>
      <Footer />
    </div>
  )
}

export default Home
