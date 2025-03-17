'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useLink from '@/hooks/useLink';
import { InvestStrategy } from '@/interfaces/interface.invest.strategy';
import { useState } from 'react';

interface InvestStrategyListProps {
    investStrategyList: InvestStrategy[];
    selectedRows: number[];
    setSelectedRows: (rows: number[]) => void;
}

export default function InvestStrategyList({
    investStrategyList,
    selectedRows,
    setSelectedRows,
}: InvestStrategyListProps) {
    const { onLink } = useLink();

    function toggleRow(id: number) {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    }

    const handleSelectAll = () => {
        if (selectedRows.length === investStrategyList.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(investStrategyList.map((item) => item.invstStrategyUid!)); 
        }
    };

    const handleSelectRow = (invstStrategyUid: number) => {
        if (selectedRows.includes(invstStrategyUid)) {
            setSelectedRows(selectedRows.filter((id) => id !== invstStrategyUid));
        } else {
            setSelectedRows([...selectedRows, invstStrategyUid]); 
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">
                        <input
                            type="checkbox"
                            checked={selectedRows.length === investStrategyList.length}
                            onChange={handleSelectAll}
                        />
                    </TableHead>
                    <TableHead>No</TableHead>
                    <TableHead>공개 여부</TableHead>
                    <TableHead>그룹코드</TableHead>
                    <TableHead>그룹명</TableHead>
                    <TableHead>포트폴리오 개수</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>수정일</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {investStrategyList.map((item, index) => (
                    <TableRow key={item.invstStrategyUid}>
                        <TableCell className="font-medium">
                            <input
                                type="checkbox"
                                checked={selectedRows.includes(item.invstStrategyUid!)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    handleSelectRow(item.invstStrategyUid!);
                                }}
                            />
                        </TableCell>
                        <TableCell className={'text-center'}>{index + 1}</TableCell>
                        <TableCell>{item.openYn}</TableCell>
                        <TableCell>{item.invstFormCd}</TableCell>
                        <TableCell
                            className="text-blue-500 cursor-pointer"
                            onClick={() => onLink(`/portfolio/group/${item.invstStrategyUid}/detail`)}
                        >
                            {item.invstName}
                        </TableCell>
                        <TableCell>{item.portfolioCount}</TableCell>
                        <TableCell>{item.regDate}</TableCell>
                        <TableCell>{item.modDate}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}