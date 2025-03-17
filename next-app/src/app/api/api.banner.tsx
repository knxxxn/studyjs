import httpClient from '@/utils/httpClient'
import { BannerUrl } from '@/enums/Url'
import { Banner, BannerSearch } from '@/interfaces/interface.banner'

/** 배너 목록 가져오기 */
export async function getBannerList(data: BannerSearch) {
  return await httpClient.get(BannerUrl.LIST, {
    openYn: data.openYn,
    stockName: data.stockName,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
  })
}

export async function removeBannerList(bannerUidList: string) {
  return await httpClient.del(BannerUrl.LIST, {
    bannerUidList: bannerUidList,
  })
}

/** 배너 등록하기 */
export async function addBanner(data: Banner) {
  return await httpClient.post(BannerUrl.INFO, data)
}

export async function getBanner(bannerUid: string) {
  return await httpClient.get(BannerUrl.INFO, { bannerUid: bannerUid })
}
