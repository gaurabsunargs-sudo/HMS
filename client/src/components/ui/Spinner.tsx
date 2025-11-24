interface propsInterface {
  heightFull?: boolean
}
const Spinner = ({ heightFull = false }: propsInterface) => {
  return (
    <div
      className={`flex ${
        !heightFull
          ? 'h-[calc(100vh_-_100px)] w-[100%-1000px]'
          : 'h-screen w-full'
      } items-center justify-center`}
    >
      <div className='h-16 w-16 animate-spin rounded-full border-t-4 border-blue-500'></div>
    </div>
  )
}

export default Spinner
