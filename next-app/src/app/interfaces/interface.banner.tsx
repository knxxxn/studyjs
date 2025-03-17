interface Banner {
  bannerUid: number | null
  stockName: string | null
  openYn: string | null
  showStartDate: string | null
  showStartTime: string | null
  showEndDate: string | null
  showEndTime: string | null
  userLevel: string | null
  channelCd: string | null
  bannerImage: string | null
  linkUrl: string | null
  modDate: string | null
  regDate: string | null
  ord: number | null
  cnt: number | null
  contents: string | null
  standard: string | null
  ratio: string | null
  openDate: string | null
}

interface BannerSearch {
  openYn: string
  stockName: string
  type: string
  startDate: string
  endDate: string
}

export type { Banner, BannerSearch }
