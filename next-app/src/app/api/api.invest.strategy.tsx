import {
  InvestStrategy,
  Portfolio,
  PortfolioGroupSearch,
  PortfolioSearch,
} from '@/interfaces/interface.invest.strategy'
import httpClient from '@/utils/httpClient'
import { InvestStrategyUrl } from '@/enums/Url'

/** 투자전략 목록 가져오기 */
export async function getInvestStrategyList(data: PortfolioGroupSearch) {
  return await httpClient.get(InvestStrategyUrl.LIST, {
    invstName: data.invstName,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
  })
}

/** 투자전략 등록하기 */
export async function addInvestStrategy(data: InvestStrategy) {
  return await httpClient.post(InvestStrategyUrl.INFO, data)
}

/** 투자전략 상세 */
export async function getInvestStrategy(invstStrategyUid: string) {
  return await httpClient.get(InvestStrategyUrl.INFO, { invstStrategyUid: invstStrategyUid })
}

/** 투자전략 목록 삭제 */
export async function removeInvestStrategyList(invstStrategyUidList: string) {
  return await httpClient.del(InvestStrategyUrl.LIST, {
    invstStrategyUidList: invstStrategyUidList,
  })
}

/** 포트폴리오 목록 가져오기 */
export async function getPortfolioList(data: PortfolioSearch) {
  return await httpClient.get(InvestStrategyUrl.PORTFOLIO_LIST, {
    searchText: data.searchText,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
  })
}

/** 포트폴리오 상세 */
export async function getPortfolio(portfolioUid: string) {
  return await httpClient.get(InvestStrategyUrl.PORTFOLIO, {
    portfolioUid: portfolioUid,
    token: '',
  })
}

/** 포트폴리오 상세 */
export async function modifyPortfolio(data: Portfolio) {
  return await httpClient.put(InvestStrategyUrl.PORTFOLIO, data)
}
