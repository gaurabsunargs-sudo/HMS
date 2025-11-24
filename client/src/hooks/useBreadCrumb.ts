import { useEffect } from 'react'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'

type BreadcrumbItem = {
  title: string
  link: string
}

export const useBreadcrumb = (items: BreadcrumbItem[]) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const breadcrumbWithDashboard: BreadcrumbItem[] = [
      { title: 'Dashboard', link: '/' },
      ...items,
    ]

    dispatch(setBreadcrumb(breadcrumbWithDashboard))
  }, [dispatch, items])
}
