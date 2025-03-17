'use client';

import MenuTitle from '@/components/common/MenuTitle';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { addThemeStock } from '@/api/api.recommend.stock';
import { ThemeStock } from '@/interfaces/interface.recommend.stock';
import ThemeStockRegistTable from '@/components/(admin)/recommendStock/themeStock/ThemeStockResigtTable';

export default function ThemeStockRegistPage() {
    const router = useRouter();
    const [themeStock, setThemeStock] = useState<ThemeStock>({
        theme: '',
        themeInfo: '',
        openYn: 'Y',
        moreReadCnt: 0,
        themeStockContentsList: [],
    });

    async function handleRegist() {
        try {
            const response = await addThemeStock(themeStock);
            if (response && response.status === 200) {
                alert('등록되었습니다.');
                router.push('/recommendStock/themeStock');
            } else {
                alert(response?.message || '등록에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('인기 테마주 등록에 실패했습니다.');
        }
    }

    return (
        <>
            <MenuTitle title={'인기 테마주 등록'} />
            <div className={'pt-8'}>
                <ThemeStockRegistTable
                    contents={themeStock}
                    setContents={setThemeStock}
                    handleRegist={handleRegist}
                />
            </div>
        </>
    );
}