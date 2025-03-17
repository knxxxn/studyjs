'use client';

import MenuTitle from '@/components/common/MenuTitle';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getInvestStrategy } from '@/api/api.invest.strategy';
import { InvestStrategy } from '@/interfaces/interface.invest.strategy';
import InvestStrategyDetailTable from '@/components/(admin)/portfolio/group/InvestStrategyDetailTable';
import { Button } from '@/components/ui/button';

export default function InvestStrategyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [investStrategy, setInvestStrategy] = useState<InvestStrategy | null>(null);

  useEffect(() => {
    async function fetchInvestStrategy() {
      try {
        const response = await getInvestStrategy(id as string);
        setInvestStrategy(response.data);
      } catch (error) {
        console.error(error);
        router.back();
      }
    }

    fetchInvestStrategy();
  }, [id, router]);

  if (!investStrategy) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <MenuTitle title={'투자 전략 상세'} />
      <div className={'pt-8'}>
        <InvestStrategyDetailTable contents={investStrategy} />
      </div>
      <div className={'flex justify-center w-full mt-4'}>
        <Button className={'w-1/6'} onClick={() => router.back()}>
          목록
        </Button>
      </div>
    </>
  );
}