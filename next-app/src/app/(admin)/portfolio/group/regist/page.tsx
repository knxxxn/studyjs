'use client';

import MenuTitle from '@/components/common/MenuTitle';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { addInvestStrategy } from '@/api/api.invest.strategy';
import { InvestStrategy } from '@/interfaces/interface.invest.strategy';
import InvestStrategyRegistTable from '@/components/(admin)/portfolio/group/InvestStrategyRegistTable';

export default function InvestStrategyRegistPage() {
  const router = useRouter();
  const [investStrategy, setInvestStrategy] = useState<InvestStrategy>({
    invstName: '',
    openYn: 'Y', 
    weekPeriod: 1, 
    currency: '원', 
    freeShowCnt: 0,
    invstFormCd: '',
  });

  async function handleRegist() {
    try {
      const response = await addInvestStrategy(investStrategy);
      if (response && response.status === 200) { 
        alert('등록되었습니다.');
        router.push('/portfolio/group');
      } else {
        alert(response?.message || '등록에 실패했습니다.'); 
      }
    } catch (error) {
      console.error('투자 전략 등록 실패:', error);
      alert('투자 전략 등록에 실패했습니다.');
    }
  }

  return (
    <>
      <MenuTitle title={'투자 전략 등록'} />
      <div className={'pt-8'}>
        <InvestStrategyRegistTable
          contents={investStrategy}
          setContents={setInvestStrategy}
          handleRegist={handleRegist}
        />
      </div>
    </>
  );
}