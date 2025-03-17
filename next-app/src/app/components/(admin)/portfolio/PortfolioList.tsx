'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Portfolio } from '@/interfaces/interface.invest.strategy';
import { getYmd } from '@/utils/commonUtil';
import useLink from '@/hooks/useLink';
import CommonPage from '@/components/common/CommonPage';
import { useEffect, useState } from 'react';

interface PortfolioListProps {
  portfolioList: Portfolio[];
  selectedRows: number[];
  setSelectedRows: (rows: number[]) => void;
}

export default function PortfolioList({
  portfolioList,
  selectedRows,
  setSelectedRows,
}: PortfolioListProps) {
  const { onLink } = useLink();
  const [pageSize, setPageSize] = useState(
    Math.floor(portfolioList.length / 10) + (portfolioList.length % 10 === 0 ? 0 : 1)
  );
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPageSize(Math.floor(portfolioList.length / 10) + (portfolioList.length % 10 === 0 ? 0 : 1));
  }, [portfolioList]);

  const handleSelectAll = () => {
    if (selectedRows.length === portfolioList.length) {
      setSelectedRows([]); 
    } else {
      setSelectedRows(portfolioList.map((item) => item.portfolioUid!)); 
    }
  };

  const handleSelectRow = (portfolioUid: number) => {
    if (selectedRows.includes(portfolioUid)) {
      setSelectedRows(selectedRows.filter((id) => id !== portfolioUid));
    } else {
      setSelectedRows([...selectedRows, portfolioUid]); 
    }
  };

  const convertToEmptyString = (value: string | undefined | null): string => {
    return value || '';
  };

  return (
    <>
      <Table className={'border'}>
        <TableHeader>
          <TableRow className={'text-center'}>
            <TableHead className="text-center">
              <input
                type="checkbox"
                checked={selectedRows.length === portfolioList.length}
                onChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className={'text-center'}>No</TableHead>
            <TableHead className={'text-center'}>공개 여부</TableHead>
            <TableHead className={'text-center'}>소속 그룹</TableHead>
            <TableHead className={'text-center'}>제목</TableHead>
            <TableHead className={'text-center'}>투자 시작일</TableHead>
            <TableHead className={'text-center'}>투자 종료일</TableHead>
            <TableHead className={'text-center'}>등록일</TableHead>
            <TableHead className={'text-center'}>수정일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolioList.slice(page * 10, (page + 1) * 10).map((item, index) => (
            <TableRow key={item.portfolioUid} onClick={() => onLink(`/portfolio/${item.portfolioUid}`)}>
              <TableCell className="text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(item.portfolioUid!)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    handleSelectRow(item.portfolioUid!);
                  }}
                />
              </TableCell>
              <TableCell className={'text-center'}>{page * 10 + index + 1}</TableCell>
              <TableCell className={'text-center'}>{convertToEmptyString(item.openYn)}</TableCell>
              <TableCell className={'text-center'}>{convertToEmptyString(item.portfolioName)}</TableCell>
              <TableCell className={'text-center'}>{convertToEmptyString(item.periodName)}</TableCell>
              <TableCell className={'text-center'}>{getYmd(convertToEmptyString(item.invstStartYmd))}</TableCell>
              <TableCell className={'text-center'}>{getYmd(convertToEmptyString(item.invstEndYmd))}</TableCell>
              <TableCell className={'text-center'}>{getYmd(convertToEmptyString(item.regDttm))}</TableCell>
              <TableCell className={'text-center'}>{getYmd(convertToEmptyString(item.edtDttm))}</TableCell>
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