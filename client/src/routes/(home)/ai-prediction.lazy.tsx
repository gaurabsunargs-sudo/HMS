import { createLazyFileRoute } from '@tanstack/react-router'
import Footer from '@/components/common/footer'
import Navigation from '@/components/common/nav'
import PageHeader from '@/components/common/page-header'
import Predictions from '@/features/predictions'

const AIDiseasePredictionPage = () => {
  return (
    <div>
      <Navigation />
      <PageHeader title='AI Disease Prediction' />
      <div className='min-h-screen bg-white pt-20'>
        <div className='container mx-auto px-6 py-8'>
          <div className=''>
            <Predictions />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const Route = createLazyFileRoute('/(home)/ai-prediction')({
  component: AIDiseasePredictionPage,
})
