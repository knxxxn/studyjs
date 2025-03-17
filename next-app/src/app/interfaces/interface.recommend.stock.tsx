interface ThemeStockSearch {
  useYn: string
  searchText: string
  startDate: string
  endDate: string
}

interface FeatureStockSearch {
  useYn: string
  startDate: string
  endDate: string
}

interface FeatureStock {
  featureStockUid?: number
  baseDate: string
  regDttm?: string
  edtDttm?: string
  openYn: string
  moreReadCnt: number
  nextFeatureStockUid?: number | null
  prevFeatureStockUid?: number | null
  featureStockContentsList: FeatureStockContents[]
}

interface FeatureStockContents {
  featureStockContentsUid: number
  featureStockUid: number
  stockName: string
  riseRate: string
  featureDetailInfo: string
}

interface ThemeStock {
  themeStockUid?: number
  theme: string
  themeInfo: string
  regDttm?: string
  edtDttm?: string
  openYn: string
  moreReadCnt: number
  themeStockContentsList: ThemeStockContents[]
}

interface ThemeStockContents {
  themeStockContentsUid?: number
  themeStockUid?: number
  stockName: string
  stockCd: string
  marketTp: string
  goalPrice: string
}

export type {
  ThemeStockSearch,
  FeatureStockSearch,
  FeatureStock,
  FeatureStockContents,
  ThemeStock,
  ThemeStockContents,
}
