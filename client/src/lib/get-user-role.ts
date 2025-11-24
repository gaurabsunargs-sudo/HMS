import Cookies from 'js-cookie'
import { decryptData } from './encryptionUtils'

export default function getUserRole(): 'admin' | 'doctor' | 'patient' {
  const cyptherUserData = Cookies.get('hms-user')
  const user = cyptherUserData ? decryptData(cyptherUserData) : {}
  if (user.role.toLowerCase() === 'admin') return 'admin'
  if (user.role.toLowerCase() === 'doctor') return 'doctor'
  if (user.role.toLowerCase() === 'user') return 'patient'
  return 'patient'
}
