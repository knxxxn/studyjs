interface PortfolioSearch {
  searchText: string
  type: string
  startDate: string
  endDate: string
}

interface PortfolioGroupSearch {
  invstName: string
  type: string
  startDate: string
  endDate: string
}

interface InvestStrategy { //수정일 등록일 확인
  invstStrategyUid?: number
  invstFormCd?: string //그룹 코드
  invstTp?: string
  invstName?: string //그룹명
  openYn?: string //공개여부
  weekPeriod?: number
  currency?: string
  freeShowCnt?: number
  modDate?: string
  regDate?: string

  portfolioCount?: number
}

interface Portfolio { //기간은 한번에 보이게 하고 공개 여부 확인인
  channelCd: any
  showStartDate: string
  showEndDate: string
  portfolioUid?: number
  invstStrategyUid?: number
  invstKey?: string
  portfolioName?: string
  descs?: string
  periodName?: string
  invstStartYmd?: string
  invstEndYmd?: string
  lastEarningRate?: string //최근
  accEarningRate?: string //누적
  threeEarningRate?: string //3개월
  sixEarningRate?: string //6개월
  annEarningRate?: string //1년년
  expectEarningRate?: string
  earningRateDesc?: string
  regDttm?: string
  edtDttm?: string
  openYn?: string
  reserveYn?: string
  reserveDttm?: string
  readCnt?: number
  invstFormCd?: string

  resInvstStrategy?: InvestStrategy
  resPortfolioStockList?: PortfolioStock[]
}

interface PortfolioStock {
  portfolioStockUid?: number
  portfolioUid?: number
  stockName?: string
  stockCd?: string
  marketTp?: string
  tradeTp?: string
  tradePrice?: string
  goalPrice?: string
  weight?: string
  sourceCompany?: string
  fiftyPrice?: string
  businessTp?: string
}

export type { PortfolioSearch, PortfolioGroupSearch, InvestStrategy, Portfolio, PortfolioStock }
