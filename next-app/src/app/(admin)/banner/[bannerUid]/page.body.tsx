'use client'

import { Banner } from '@/interfaces/interface.banner'
import { Fragment } from 'react'
import MenuTitle from '@/components/common/MenuTitle'
import BannerDetailTable from '@/components/(admin)/banner/detail/BannerDetailTable'

export default function BannerDetailBody({ contents }: { contents: Banner }) {
  return (
    <>
      <MenuTitle title={'배너 수정'} />
      <div className={'mt-4'}>
        <BannerDetailTable contents={contents} />
      </div>
    </>
  )
}
