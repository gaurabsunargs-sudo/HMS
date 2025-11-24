import { useState } from 'react'
import { ChevronDown, HelpCircle, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer:
        'You can book an appointment easily through our online portal, by calling our helpline, or by visiting our hospital directly. Our staff will help you find the most convenient time slot.',
    },
    {
      question: 'What should I bring to my first visit?',
      answer:
        'Please bring a valid ID, insurance card (if applicable), list of current medications, and any previous medical records. This helps our doctors provide you with the best care.',
    },
    {
      question: 'Do you accept insurance?',
      answer:
        'Yes, we accept most major insurance plans. Please contact our billing department before your visit to verify coverage and understand any out-of-pocket costs.',
    },
    {
      question: 'What are your emergency services?',
      answer:
        'Our emergency department is open 24/7 with trained medical professionals ready to handle urgent medical situations. For life-threatening emergencies, call our emergency hotline immediately.',
    },
    {
      question: 'Can I get my test results online?',
      answer:
        "Yes, you can access your test results through our secure patient portal. Results are typically available within 24-48 hours, and you'll receive a notification when they're ready.",
    },
    {
      question: 'How do I contact my doctor?',
      answer:
        "You can reach your doctor through our patient portal messaging system, by calling our main number and asking for the doctor's office, or during scheduled follow-up appointments.",
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className='relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-16'>
      {/* Background decoration */}
      <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366F1" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-40'></div>

      <div className='relative container mx-auto px-6'>
        <div className='mb-12 text-center'>
          <h2 className='mb-4 bg-gradient-to-r from-gray-800 via-blue-800 to-gray-800 bg-clip-text text-3xl font-bold text-transparent'>
            Frequently Asked Questions
          </h2>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-600'>
            Find answers to common questions about our services, appointments,
            and how we can help you and your family.
          </p>
        </div>

        <div className='mx-auto max-w-4xl space-y-4'>
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className={`group cursor-pointer border-2 border-dashed transition-all duration-300 hover:shadow-lg ${
                openIndex === index
                  ? 'border-blue-500 bg-blue-50/50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
              onClick={() => toggleFAQ(index)}
            >
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <h3
                    className={`text-lg font-semibold transition-colors duration-300 ${
                      openIndex === index ? 'text-blue-700' : 'text-gray-800'
                    }`}
                  >
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${
                      openIndex === index
                        ? 'rotate-180 text-blue-600'
                        : 'text-gray-500'
                    }`}
                  />
                </div>
                {openIndex === index && (
                  <div className='mt-4 border-t border-blue-200 pt-4'>
                    <p className='leading-relaxed text-gray-700'>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='mt-12 text-center'>
          <div className='mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-8 shadow-2xl'>
            <h3 className='mb-2 text-xl font-bold text-white'>
              Still Have Questions?
            </h3>
            <p className='mb-4 text-blue-100'>
              Our friendly team is here to help. Don't hesitate to reach out
              with any questions or concerns. Call us at{' '}
              <a
                href='tel:9810325922'
                className='font-semibold text-white transition-colors hover:text-blue-200'
              >
                9810325922
              </a>
            </p>
            <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
              <a
                href='tel:9810325922'
                className='inline-flex items-center justify-center rounded-full bg-white px-8 py-3 font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-50 hover:shadow-lg'
              >
                <Phone className='mr-2 h-4 w-4' />
                Contact Us: 9810325922
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQSection
