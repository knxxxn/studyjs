'use client'

import { Portfolio } from '@/interfaces/interface.invest.strategy'
import { Fragment } from 'react'
import MenuTitle from '@/components/common/MenuTitle'
import PortfolioDetailTable from '@/components/(admin)/portfolio/detail/PortfolioDetailTable'

export default function PortfolioDetailBody({ contents }: { contents:Portfolio }) {
  return (
    <>
      <MenuTitle title={'포트폴리오 상세'} />
      <div className={'mt-4'}>
        <PortfolioDetailTable contents={contents} />
      </div>
    </>
  )
}
