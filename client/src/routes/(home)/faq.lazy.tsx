import { useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Footer from '@/components/common/footer'
import Navigation from '@/components/common/nav'
import PageHeader from '@/components/common/page-header'

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    )
  }

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer:
        'You can book an appointment by calling our appointment line at 9810325922, visiting our website, or coming to the hospital in person. We also offer online appointment booking through our patient portal.',
    },
    {
      question: 'What are your visiting hours?',
      answer:
        'Our visiting hours are from 8:00 AM to 8:00 PM for general wards. ICU visiting hours are from 10:00 AM to 12:00 PM and 4:00 PM to 6:00 PM. Emergency services are available 24/7.',
    },
    {
      question: 'Do you accept insurance?',
      answer:
        'Yes, we accept most major insurance plans. Please bring your insurance card and a valid ID when you visit. We recommend contacting your insurance provider beforehand to confirm coverage.',
    },
    {
      question: 'What should I bring for my first visit?',
      answer:
        'Please bring a valid ID, insurance card (if applicable), list of current medications, medical records from previous visits, and any relevant test results or imaging studies.',
    },
    {
      question: 'How do I get my test results?',
      answer:
        'Test results are typically available within 24-48 hours. You can access them through our patient portal, pick them up at the hospital, or have them mailed to you. Critical results will be communicated immediately.',
    },
    {
      question: 'Do you have parking facilities?',
      answer:
        'Yes, we have ample parking facilities for patients and visitors. Valet parking is available for patients with mobility issues. Parking is free for the first 2 hours.',
    },
    {
      question: 'Can I get a second opinion?',
      answer:
        'Absolutely. We encourage patients to seek second opinions when needed. Our specialists are available for consultation and can review your case and provide their professional assessment.',
    },
    {
      question: 'What emergency services do you provide?',
      answer:
        'We provide comprehensive emergency services including trauma care, cardiac emergencies, stroke treatment, pediatric emergencies, and general emergency care. Our emergency department is staffed 24/7 with board-certified emergency physicians.',
    },
    {
      question: 'How do I access my medical records?',
      answer:
        'You can access your medical records through our secure patient portal. You can also request copies by filling out a medical records release form at the hospital or contacting our medical records department.',
    },
    {
      question: 'Do you offer telemedicine services?',
      answer:
        'Yes, we offer telemedicine services for follow-up appointments, consultations, and certain types of care. This allows you to receive medical care from the comfort of your home when appropriate.',
    },
  ]

  return (
    <div>
      <Navigation />
      <PageHeader title='Frequently Asked Questions' />
      <div className='min-h-screen bg-gray-50 pt-20'>
        {/* Hero Section */}
        <div className='bg-gradient-to-br from-blue-50 to-purple-50 py-16'>
          <div className='container mx-auto px-6'>
            <div className='text-center'>
              <h1 className='mb-4 text-4xl font-bold text-gray-800'>
                Frequently Asked Questions
              </h1>
              <p className='mx-auto max-w-2xl text-lg text-gray-600'>
                Find answers to common questions about our services,
                appointments, and hospital policies.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className='bg-white py-16'>
          <div className='container mx-auto px-6'>
            <div className='mx-auto max-w-4xl'>
              <div className='space-y-4'>
                {faqs.map((faq, index) => (
                  <Card key={index} className='shadow-lg'>
                    <CardContent className='p-0'>
                      <button
                        onClick={() => toggleItem(index)}
                        className='w-full p-6 text-left transition-colors hover:bg-gray-50'
                      >
                        <div className='flex items-center justify-between'>
                          <h3 className='text-lg font-semibold text-gray-800'>
                            {faq.question}
                          </h3>
                          {openItems.includes(index) ? (
                            <ChevronUp className='h-5 w-5 text-purple-600' />
                          ) : (
                            <ChevronDown className='h-5 w-5 text-purple-600' />
                          )}
                        </div>
                      </button>
                      {openItems.includes(index) && (
                        <div className='px-6 pb-6'>
                          <p className='leading-relaxed text-gray-600'>
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className='bg-gray-50 py-16'>
          <div className='container mx-auto px-6'>
            <div className='text-center'>
              <h2 className='mb-4 text-3xl font-bold text-gray-800'>
                Still Have Questions?
              </h2>
              <p className='mb-8 text-lg text-gray-600'>
                Can't find the answer you're looking for? Contact us directly.
              </p>
              <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                <a
                  href='tel:9810325922'
                  className='rounded-lg bg-purple-600 px-8 py-3 text-white transition-colors hover:bg-purple-700'
                >
                  Call Us: 9810325922
                </a>
                <a
                  href='mailto:info@pulsepoint.com'
                  className='rounded-lg border border-purple-600 px-8 py-3 text-purple-600 transition-colors hover:bg-purple-50'
                >
                  Email Us: info@pulsepoint.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const Route = createLazyFileRoute('/(home)/faq')({
  component: FAQPage,
})
