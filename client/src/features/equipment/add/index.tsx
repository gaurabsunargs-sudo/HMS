import { useBreadcrumb } from '@/hooks/useBreadCrumb'

const AddEquipment = () => {
  useBreadcrumb([{ link: '/equipment/add', title: 'Add Equipment' }])
  return <div>Add Equipment</div>
}

export default AddEquipment
