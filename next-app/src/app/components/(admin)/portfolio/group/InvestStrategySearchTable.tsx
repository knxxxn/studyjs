'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PortfolioGroupSearch } from '@/interfaces/interface.invest.strategy';
import CommonDoubleCalendar from '@/components/common/CommonDoubleCalendar';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatDateToYmdHyphen } from '@/utils/commonUtil';

interface InvestStrategySearchTableProps {
    searchFunc: (data: PortfolioGroupSearch) => void;
}

export default function InvestStrategySearchTable({ searchFunc }: InvestStrategySearchTableProps) {
    const [search, setSearch] = useState<PortfolioGroupSearch>({
        invstName: '',
        type: 'ALL',
        startDate: format(addDays(new Date(), -30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
    });
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    useEffect(() => {
        clickSearch();
    }, []);

    function clickSearch() {
        if (date?.from && date?.to) {
            const formattedSearch = {
                ...search,
                startDate: format(date.from, 'yyyy-MM-dd'),
                endDate: format(date.to, 'yyyy-MM-dd'),
            };
            setSearch(formattedSearch);
            searchFunc(formattedSearch);
        }
    }

    return (
        <>
            <Table className={'border'}>
                <TableBody>
                    <TableRow>
                        <TableCell className={'font-bold min-w-20 pl-4 border-r-2'}>검색</TableCell>
                        <TableCell className={'min-w-96 p-4'}>
                            <div className={'flex items-center gap-2'}>
                                <Input
                                    type="text"
                                    id="invstName"
                                    value={search.invstName}
                                    onChange={(e) => setSearch({ ...search, invstName: e.target.value })}
                                />
                            </div>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={'font-bold min-w-20 pl-4 border-r-2'}>기간</TableCell>
                        <TableCell className={'min-w-96 p-4'}>
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