import { useBreadcrumb } from '@/hooks/useBreadCrumb'

const Equipment = () => {
  useBreadcrumb([{ link: '/equipment', title: 'Equipment Management' }])
  return <div>Equipment</div>
}

export default Equipment
