import {
  FeatureStockSearch,
  ThemeStock,
  ThemeStockSearch,
} from '@/interfaces/interface.recommend.stock'
import httpClient from '@/utils/httpClient'
import { RecommendStockUrl } from '@/enums/Url'

/** 인기 테마주 리스트 */
export async function getThemeStockList(data: ThemeStockSearch) {
  return await httpClient.get(RecommendStockUrl.THEME_LIST, {
    useYn: data.useYn,
    searchText: data.searchText,
    startDate: data.startDate,
    endDate: data.endDate,
  })
}

/** 인기 테마주 */
export async function getThemeStock(themeStockUid: string) {
  return await httpClient.get(RecommendStockUrl.THEME, {
    themeStockUid: themeStockUid,
  })
}

/** 인기 테마주 수정 */
export async function modifyThemeStock(data: ThemeStock) {
  return await httpClient.put(RecommendStockUrl.THEME, data)
}

/** 인기 테마주 등록 */
export async function addThemeStock(data: ThemeStock) {
  return await httpClient.post(RecommendStockUrl.THEME, data)
}

/** 오늘의 특징주 리스트 */
export async function getFeatureStockList(data: FeatureStockSearch) {
  return await httpClient.get(RecommendStockUrl.FEATURE_LIST, {
    useYn: data.useYn,
    startDate: data.startDate,
    endDate: data.endDate,
  })
}

/** 오늘의 특징주 리스트 삭제 */
export async function removeFeatureStockList(featureStockUids: string) {
  return await httpClient.del(RecommendStockUrl.FEATURE_LIST, {
    featureStockUids: featureStockUids,
  })
}

/** 인기 테마주 리스트 삭제 */
export async function removeThemeStockList(themeStockUids: string) {
  return await httpClient.del(RecommendStockUrl.THEME_LIST, {
    themeStockUids: themeStockUids,
  })
}
