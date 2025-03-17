'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getThemeStock, modifyThemeStock } from '@/api/api.recommend.stock';
import { ThemeStock } from '@/interfaces/interface.recommend.stock';
import ThemeStockDetailTable from '@/components/(admin)/recommendStock/themeStock/ThemeStockDetailTable';

export default function ThemeStockDetailPageWrapper() {
    const params = useParams();
    const { themeStockUid } = params;
    const [themeStock, setThemeStock] = useState<ThemeStock | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getThemeStock(themeStockUid as string);
                setThemeStock(response.data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || '데이터를 불러오는 데 실패했습니다.');
                setLoading(false);
            }
        }
        fetchData();
    }, [themeStockUid]);

    if (!themeStock) {
        return <div>테마주 정보를 불러올 수 없습니다.</div>;
    }

    return <ThemeStockDetailTable contents={themeStock} />;
}