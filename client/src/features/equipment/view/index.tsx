import { useBreadcrumb } from '@/hooks/useBreadCrumb'

const ViewEquipment = () => {
  useBreadcrumb([{ link: '/equipment/view', title: 'View Equipment' }])
  return <div>View Equipment</div>
}

export default ViewEquipment
