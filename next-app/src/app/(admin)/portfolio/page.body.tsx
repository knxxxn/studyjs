'use client';

import MenuTitle from '@/components/common/MenuTitle';
import { useState } from 'react';
import useLink from '@/hooks/useLink';
import { getPortfolioList, removeInvestStrategyList } from '@/api/api.invest.strategy';
import { Portfolio, PortfolioSearch } from '@/interfaces/interface.invest.strategy';
import PortfolioList from '@/components/(admin)/portfolio/PortfolioList';
import PortfolioSearchTable from '@/components/(admin)/portfolio/PortfolioSearchTable';
import TableControlButton from '@/components/common/TableControlButton';

export default function PortfolioBody() {
  const { onLink } = useLink();
  const [portfolioList, setPortfolioList] = useState<Portfolio[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  async function searchFunc(data: PortfolioSearch) {
    console.log(data);
    const response = await getPortfolioList(data);
    setPortfolioList(response.data);
  }

  return (
    <>
      <MenuTitle title={'포트폴리오'} />
      <div className={'pt-8'}>
        <PortfolioSearchTable searchFunc={searchFunc} />
      </div>
      <div className={'pt-8'}>
        {portfolioList.length > 0 && (
          <PortfolioList
            portfolioList={portfolioList}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        )}
      </div>
    </>
  );
}