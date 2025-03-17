'use client';

import MenuTitle from '@/components/common/MenuTitle';
import { useState, useEffect } from 'react';
import useLink from '@/hooks/useLink';
import { getThemeStockList, removeThemeStockList } from '@/api/api.recommend.stock';
import { ThemeStock, ThemeStockSearch } from '@/interfaces/interface.recommend.stock';
import ThemeStockList from '@/components/(admin)/recommendStock/themeStock/ThemeStockList';
import ThemeStockSearchTable from '@/components/(admin)/recommendStock/themeStock/ThemeStockSearchTable';
import TableControlButton from '@/components/common/TableControlButton';
import { format } from 'date-fns';

export default function ThemeStockPage() {
    const { onLink } = useLink();
    const [themeStockList, setThemeStockList] = useState<ThemeStock[]>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function searchFunc(data: ThemeStockSearch) {
        setIsLoading(true);
        try {
            const response = await getThemeStockList(data);
            setThemeStockList(response.data);
        } catch (error) {
            console.error(error);
            alert('테마주 목록 조회에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }

    async function clickRemove() {
        if (selectedRows.length > 0) {
            if (confirm('삭제하시겠습니까?')) {
                try {
                    const response = await removeThemeStockList(selectedRows.join());
                    if (response.status === 200) {
                        alert('삭제되었습니다.');
                        await searchFunc({
                            useYn: 'Y',
                            searchText: '',
                            startDate: format(new Date(0), 'yyyy-MM-dd'),
                            endDate: format(new Date(), 'yyyy-MM-dd'),
                        });
                    }
                } catch (error) {
                    console.error(error);
                    alert('테마주 삭제에 실패했습니다.');
                }
            }
        }
    }

    useEffect(() => {
        searchFunc({
            useYn: 'Y',
            searchText: '',
            startDate: format(new Date(0), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
        });
    }, []);

    return (
        <>
            <MenuTitle title={'인기 테마주'} />
            <div className={'pt-8'}>
                <ThemeStockSearchTable searchFunc={searchFunc} />
            </div>
            <div className={'pt-8 text-right'}>
                <TableControlButton
                    registFunction={() => onLink('/recommendStock/themeStock/regist')}
                    removeFunction={clickRemove}
                />
            </div>
            <div className={'pt-8'}>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    themeStockList.length > 0 && (
                        <ThemeStockList
                            themeStockList={themeStockList}
                            selectedRows={selectedRows}
                            setSelectedRows={setSelectedRows}
                        />
                    )
                )}
            </div>
        </>
    );
}