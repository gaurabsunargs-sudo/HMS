import Cookies from 'js-cookie'
import { decryptData } from '@/lib/encryptionUtils'

export function getUserData() {
  try {
    const userData = decryptData(Cookies.get('hms-user'))
    return userData && userData.id ? userData : null
  } catch (error) {
    console.error('Failed to decrypt user data:', error)
    return null
  }
}
