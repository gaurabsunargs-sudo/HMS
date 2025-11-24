import { useBreadcrumb } from '@/hooks/useBreadCrumb'

const DoctorSchedule = () => {
  useBreadcrumb([{ link: '/doctors/schedule', title: 'My Schedule' }])
  return <div>Doctor Schedule</div>
}

export default DoctorSchedule
