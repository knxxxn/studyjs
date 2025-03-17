'use client'

import MenuTitle from '@/components/common/MenuTitle'

import { getBannerList, removeBannerList } from '@/api/api.banner'
import { Banner, BannerSearch } from '@/interfaces/interface.banner'
import { useState } from 'react'
import BannerList from '@/components/(admin)/banner/BannerList'
import { Button } from '@/components/ui/button'
import useLink from '@/hooks/useLink'
import BannerSearchTable from '@/components/(admin)/banner/BannerSearchTable'
import TableControlButton from '@/components/common/TableControlButton'

export default function BannerBody() {
  const { onLink } = useLink()
  const [bannerList, setBannerList] = useState<Banner[]>([])
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  async function searchFunc(data: BannerSearch) {
    console.log(data)
    const response = await getBannerList(data)

    setBannerList(response.data)
  }

  async function clickRemove() {
    if (selectedRows.length > 0) {
      if (confirm('삭제하시겠습니까?')) {
        const response = await removeBannerList(selectedRows.join())
        if (response.status === 200) {
          alert('삭제되었습니다.')
          await searchFunc({
            openYn: 'ALL',
            stockName: '',
            type: 'ALL',
            startDate: '0000-01-01',
            endDate: '9999-12-31',
          })
        }
      }
    }
  }

  return (
    <>
      <MenuTitle title={'메인배너'} />
      <div className={'pt-8'}>
        <BannerSearchTable searchFunc={searchFunc} />
      </div>
      <div className={'pt-8 text-right'}>
        <TableControlButton
          registFunction={() => onLink('/banner/regist')}
          removeFunction={clickRemove}
        />
      </div>
      <div className={'pt-8'}>
        {bannerList.length > 0 && (
          <BannerList
            bannerList={bannerList}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        )}
      </div>
    </>
  )
}
