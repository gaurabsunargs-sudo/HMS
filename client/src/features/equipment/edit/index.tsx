import { useBreadcrumb } from '@/hooks/useBreadCrumb'

const EditEquipment = () => {
  useBreadcrumb([{ link: '/equipment/edit', title: 'Edit Equipment' }])
  return <div>Edit Equipment</div>
}

export default EditEquipment
