'use client';

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useLink from '@/hooks/useLink';
import { ThemeStock, ThemeStockContents } from '@/interfaces/interface.recommend.stock';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { modifyThemeStock } from '@/api/api.recommend.stock';

interface ThemeStockDetailPageProps {
    contents: ThemeStock;
}

export default function ThemeStockDetailTable({ contents }: ThemeStockDetailPageProps) {
    const { onBack } = useLink();
    const [themeStock, setThemeStock] = useState<ThemeStock>(contents);

    async function clickModify() {
        try {
            await modifyThemeStock(themeStock);
            alert('수정되었습니다.');
            onBack();
        } catch (err: any) {
            alert(err.message || '수정에 실패했습니다.');
        }
    }

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) {
            return '';
        }
        return dateString.split(' ')[0];
    };

    return (
        <><h2 className="text-lg font-bold mb-4">인기 테마주</h2>
            <Table className={'border'}>
                <TableBody>
                    <TableRow>
                        <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>등록일/수정일</TableCell>
                        <TableCell className={'p-4'}>
                            {themeStock.regDttm && `${formatDate(themeStock.regDttm)}`}
                            {themeStock.edtDttm && ` / ${formatDate(themeStock.edtDttm)}`}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>공개</TableCell>
                        <TableCell className={'p-4'}>
                            <RadioGroup
                                value={themeStock.openYn}
                                className={'flex'}
                                onValueChange={(e) => setThemeStock({ ...themeStock, openYn: e })}
                            >
                                <span className={'flex items-center mr-4'}>
                                    <RadioGroupItem value="Y" id="r1" className={'mr-1'} />
                                    <Label htmlFor="r1">Y</Label>
                                </span>
                                <span className={'flex items-center mr-4'}>
                                    <RadioGroupItem value="N" id="r2" className={'mr-1'} />
                                    <Label htmlFor="r2">N</Label>
                                </span>
                            </RadioGroup>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={'font-bold pl-4 border-r-2'}>테마명</TableCell>
                        <TableCell className={'p-4'}>
                            <Input
                                type="text"
                                placeholder="테마명"
                                value={themeStock.theme || ''}
                                onChange={(e) => setThemeStock({ ...themeStock, theme: e.target.value })}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={'font-bold pl-4 border-r-2'}>테마소개</TableCell>
                        <TableCell className={'p-4'}>
                            <Textarea
                                placeholder="테마 설명"
                                value={themeStock.themeInfo || ''}
                                onChange={(e) => setThemeStock({ ...themeStock, themeInfo: e.target.value })}
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <div className={'flex justify-center w-full mt-4'}>
                <Button className={'w-1/6 mr-4'} onClick={clickModify}>
                    수정
                </Button>
                <Button className={'w-1/6'} onClick={() => onBack()}>
                    취소
                </Button>
            </div>
            <div className="mt-8">
                <h2 className="text-lg font-bold mb-4">리스트</h2>
                <Table className={'border'}>
                    <TableBody>
                        <TableRow>
                            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>No</TableCell>
                            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>종목명</TableCell>
                            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>종목코드</TableCell>
                            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>시장</TableCell>
                            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>목표가</TableCell>
                        </TableRow>
                        {themeStock.themeStockContentsList?.map((stock: ThemeStockContents, index) => (
                            <TableRow key={stock.themeStockContentsUid}>
                                <TableCell className={'p-4'}>{index + 1}</TableCell>
                                <TableCell className={'p-4'}>{stock.stockName}</TableCell>
                                <TableCell className={'p-4'}>{stock.stockCd}</TableCell>
                                <TableCell className={'p-4'}>{stock.marketTp}</TableCell>
                                <TableCell className={'p-4'}>{stock.goalPrice}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}