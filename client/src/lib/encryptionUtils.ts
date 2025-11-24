// encryptionUtils.ts
import CryptoJS from 'crypto-js'

const SECRET_KEY =
  '9Uk|Yug@hq$qkO,]0s|pf!-T-!<yRzWZ_J7[AW*X}+_A+D@&0SdsNAS4`Q)63wS'

export const encryptData = (data: any): any => {
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY
  ).toString()

  const base64Ciphertext = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(ciphertext)
  )
  return base64Ciphertext
}

export const decryptData = (base64Ciphertext: any): any => {
  try {
    const decodedCiphertext = CryptoJS.enc.Base64.parse(
      base64Ciphertext
    ).toString(CryptoJS.enc.Utf8)
    const bytes = CryptoJS.AES.decrypt(decodedCiphertext, SECRET_KEY)
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    return decryptedData
  } catch (e) {
    return ''
  }
}
