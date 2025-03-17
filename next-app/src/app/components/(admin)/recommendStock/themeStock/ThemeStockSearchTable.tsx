'use client';

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { formatDateToYmdHyphen } from '@/utils/commonUtil';
import CommonDoubleCalendar from '@/components/common/CommonDoubleCalendar';
import { ThemeStockSearch } from '@/interfaces/interface.recommend.stock';

export default function ThemeStockSearchTable({ searchFunc }: { searchFunc: (data: ThemeStockSearch ) => void }) {
  const [search, setSearch] = useState({
    openYn: 'ALL',
    searchText: '',
    type: 'ALL',
  });

  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    clickSearch();
  }, []);

  function clickSearch() {
    const data: ThemeStockSearch = {
        ...search,
        startDate: date?.from ? formatDateToYmdHyphen(date.from) : '',
        endDate: date?.to ? formatDateToYmdHyphen(date.to) : '',
        useYn: ''
    };
    searchFunc(data);
  }


  return (
    <>
      <Table className={'border'}>
        <TableBody>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>검색</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                value={search.searchText}
                onChange={(e) => setSearch({ ...search, searchText: e.target.value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>기간</TableCell>
            <TableCell className={'p-4'}>
              <RadioGroup
                defaultValue="ALL"
                className={'flex'}
                onValueChange={(e) => setSearch({ ...search, type: e })}
              >
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="ALL" id="t1" className={'mr-1'} />
                  <Label htmlFor="t1">전체</Label>
                </span>
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="invstStartYmd" id="t2" className={'mr-1'} />
                  <Label htmlFor="t2">등록일</Label>
                </span>
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="invstEndYmd" id="t3" className={'mr-1'} />
                  <Label htmlFor="t3">수정일</Label>
                </span>
              </RadioGroup>
              {search.type !== 'ALL' && (
                <div className={'mt-4'}>
                  <CommonDoubleCalendar date={date} setDate={setDate} />
                </div>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className={'flex justify-center w-full mt-4'}>
        <Button className={'w-1/4'} onClick={clickSearch}>
          조회
        </Button>
      </div>
    </>
  );
}