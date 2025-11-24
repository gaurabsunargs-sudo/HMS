interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='bg-primary-foreground container grid h-full flex-col items-center justify-center lg:max-w-none lg:px-0'>
      <div className='mx-auto flex w-full flex-col items-center justify-center space-y-2 sm:w-[480px] lg:p-8'>
        {children}
      </div>
    </div>
  )
}
