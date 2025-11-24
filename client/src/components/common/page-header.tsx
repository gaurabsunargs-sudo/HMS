import { Link } from '@tanstack/react-router'

const PageHeader = ({
  title,
  titleLink,
  subtitle,
}: {
  title: string
  titleLink?: string
  subtitle?: string
}) => {
  return (
    <div className='relative h-[240px] bg-[#0f172b] shadow-lg md:h-[300px]'>
      <div className='relative z-10 container mx-auto px-4'>
        <div className='mx-auto flex h-[260px] max-w-4xl flex-col items-center justify-center pt-2 text-center md:h-[300px]'>
          <h1 className='mb-4 text-3xl leading-tight font-bold text-white lg:text-5xl'>
            {subtitle || title}
          </h1>
          <p className='flex items-center gap-2 text-white/50'>
            <Link href={titleLink || '/'} className='hover:text-white'>
              Home
            </Link>
            /
            {titleLink ? (
              <Link href={titleLink || '/'} className='hover:text-white'>
                {title}
              </Link>
            ) : (
              <span className='text-white'>{title}</span>
            )}
            {subtitle && (
              <>
                /
                {subtitle ? (
                  <Link href={titleLink || '/'} className='text-white'>
                    {subtitle}
                  </Link>
                ) : (
                  <span className='text-white'>{subtitle}</span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
      <div className='custom-shape-divider-top-1758629210 absolute top-[300px] right-0 bottom-0 left-0 z-50'>
        <svg
          data-name='Layer 1'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 1200 120'
          preserveAspectRatio='none'
        >
          <path
            d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z'
            className='shape-fill'
          ></path>
        </svg>
      </div>
    </div>
  )
}

export default PageHeader
