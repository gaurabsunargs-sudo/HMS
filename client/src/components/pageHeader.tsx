import { CardDescription, CardHeader, CardTitle } from './ui/card'

interface propsInterface {
  title: string
  description: string
}

const PageHeader = ({ title, description }: propsInterface) => {
  return (
    <>
      <CardHeader className='!p-0'>
        <CardTitle className='text-left text-2xl font-bold'>{title}</CardTitle>
        <CardDescription className='!-mt-[1px]'>{description}</CardDescription>
      </CardHeader>
    </>
  )
}

export default PageHeader
