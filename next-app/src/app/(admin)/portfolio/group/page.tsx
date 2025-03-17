'use client';

import MenuTitle from '@/components/common/MenuTitle';
import { useState, useEffect } from 'react'; 
import useLink from '@/hooks/useLink';
import { getInvestStrategyList, removeInvestStrategyList } from '@/api/api.invest.strategy';
import { InvestStrategy, PortfolioGroupSearch } from '@/interfaces/interface.invest.strategy';
import InvestStrategyList from '@/components/(admin)/portfolio/group/InvestStrategyList';
import InvestStrategySearchTable from '@/components/(admin)/portfolio/group/InvestStrategySearchTable';
import TableControlButton from '@/components/common/TableControlButton';
import { format } from 'date-fns';

export default function PortfolioGroupBody() {
  const { onLink } = useLink();
  const [investStrategyList, setInvestStrategyList] = useState<InvestStrategy[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true); 

  async function searchFunc(data: PortfolioGroupSearch) {
    setIsLoading(true); 
    try {
      const response = await getInvestStrategyList(data);
      setInvestStrategyList(response.data);
    } catch (error) {
      console.error(error);
      alert('투자 전략 목록 조회에 실패했습니다.');
    } finally {
      setIsLoading(false); 
    }
  }

  async function clickRemove() {
    if (selectedRows.length > 0) {
      if (confirm('삭제하시겠습니까?')) {
        try {
          const response = await removeInvestStrategyList(selectedRows.join());
          if (response.status === 200) {
            alert('삭제되었습니다.');
            await searchFunc({
              invstName: '',
              type: 'ALL',
              startDate: format(new Date(0), 'yyyy-MM-dd'), 
              endDate: format(new Date(), 'yyyy-MM-dd'),
            });
          }
        } catch (error) {
          console.error(error);
          alert('투자 전략 삭제에 실패했습니다.');
        }
      }
    }
  }

  useEffect(() => {
    searchFunc({
      invstName: '',
      type: 'ALL',
      startDate: format(new Date(0), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    });
  }, []);

  return (
    <>
      <MenuTitle title={'포트폴리오 그룹'} />
      <div className={'pt-8'}>
        <InvestStrategySearchTable searchFunc={searchFunc} />
      </div>
      <div className={'pt-8 text-right'}>
        <TableControlButton
          registFunction={() => onLink('/portfolio/group/regist')}
          removeFunction={clickRemove}
        />
      </div>
      <div className={'pt-8'}>
        {isLoading ? (
          <div>Loading...</div> 
        ) : (
          investStrategyList.length > 0 && (
            <InvestStrategyList
              investStrategyList={investStrategyList}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
            />
          )
        )}
      </div>
    </>
  );
}