import { useBreadcrumb } from '@/hooks/useBreadCrumb'

const PredictionHistory = () => {
  useBreadcrumb([{ link: '/predictions/history', title: 'Prediction History' }])
  return <div>Prediction History</div>
}

export default PredictionHistory
