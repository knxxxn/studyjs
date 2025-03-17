import httpClient from '@/utils/httpClient'
import { CommonUrl } from '@/enums/Url'

export async function fileUpload(formData: FormData) {
  return await httpClient.postFile(CommonUrl.IMAGE_UPLOAD, formData)
}

export async function removeFile(path: string) {
  return await httpClient.del(CommonUrl.IMAGE_UPLOAD, { path: path })
}
