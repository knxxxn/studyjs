'use client'

import MenuTitle from '@/components/common/MenuTitle'
import BannerRegistTable from '@/components/(admin)/banner/regist/BannerRegistTable'

export default function BannerRegistBody() {
  return (
    <>
      <MenuTitle title={'배너 등록'} />
      <div className={'mt-4'}>
        <BannerRegistTable />
      </div>
    </>
  )
}
