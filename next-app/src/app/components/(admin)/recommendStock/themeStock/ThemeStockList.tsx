'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useLink from '@/hooks/useLink';
import { ThemeStock } from '@/interfaces/interface.recommend.stock';
import { useState, useEffect } from 'react';
import CommonPage from '@/components/common/CommonPage'; 

interface ThemeStockListProps {
    themeStockList: ThemeStock[];
    selectedRows: number[];
    setSelectedRows: (rows: number[]) => void;
}

export default function ThemeStockList({
    themeStockList,
    selectedRows,
    setSelectedRows,
}: ThemeStockListProps) {
    const { onLink } = useLink();
    const [pageSize, setPageSize] = useState(
        Math.floor(themeStockList.length / 10) + (themeStockList.length % 10 === 0 ? 0 : 1)
    );
    const [page, setPage] = useState(0);

    useEffect(() => {
        setPageSize(Math.floor(themeStockList.length / 10) + (themeStockList.length % 10 === 0 ? 0 : 1));
    }, [themeStockList]);

    function toggleRow(id: number) {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    }

    const handleSelectAll = () => {
        if (selectedRows.length === themeStockList.length) {
            setSelectedRows([]); 
        } else {
            setSelectedRows(themeStockList.map((item) => item.themeStockUid!)); 
        }
    };

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) {
            return '';
        }
        return dateString.split(' ')[0];
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">
                            <input
                                type="checkbox"
                                checked={selectedRows.length === themeStockList.length}
                                onChange={handleSelectAll}
                            />
                        </TableHead>
                        <TableHead>No</TableHead>
                        <TableHead>공개</TableHead>
                        <TableHead>테마명</TableHead>
                        <TableHead>등록일</TableHead>
                        <TableHead>수정일</TableHead>
                        <TableHead>조회수</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {themeStockList.slice(page * 10, (page + 1) * 10).map((item, index) => (
                        <TableRow key={item.themeStockUid}>
                            <TableCell className="font-medium">
                                <Checkbox
                                    id={`row-${item.themeStockUid}`}
                                    checked={selectedRows.includes(item.themeStockUid!)}
                                    onCheckedChange={() => toggleRow(item.themeStockUid!)}
                                />
                            </TableCell>
                            <TableCell className={'text-center'}>{page * 10 + index + 1}</TableCell>
                            <TableCell className={'text-center'}>{item.openYn}</TableCell>
                            <TableCell
                                className="text-blue-500 cursor-pointer"
                                onClick={() => onLink(`/recommendStock/themeStock/${item.themeStockUid}/detail`)}
                            >
                                {item.theme}
                            </TableCell>
                            <TableCell>{formatDate(item.regDttm)}</TableCell>
                            <TableCell>{formatDate(item.edtDttm)}</TableCell>
                            <TableCell>{item.moreReadCnt}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className={'mt-4'}>
                <CommonPage page={page} setPage={setPage} pageSize={pageSize} />
            </div>
        </>
    );
}