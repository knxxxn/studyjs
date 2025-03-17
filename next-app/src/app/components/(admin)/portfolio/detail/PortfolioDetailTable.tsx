'use client';

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import useLink from '@/hooks/useLink'
import { Portfolio, PortfolioStock } from '@/interfaces/interface.invest.strategy'
import { DateRange } from 'react-day-picker'
import { formatDateToYmd, formatYmdToDate } from '@/utils/commonUtil'
import { modifyPortfolio } from '@/api/api.invest.strategy'
import CommonDoubleCalendar from '@/components/common/CommonDoubleCalendar'
import { useState } from 'react'

export default function PortfolioDetailTable({ contents }: { contents: Portfolio }) {
  const { onBack } = useLink()

  const [portfolio, setPortfolio] = useState<Portfolio>(contents)
  const [date, setDate] = useState<DateRange | undefined>({
    from: formatYmdToDate(contents.invstStartYmd || ''),
    to: formatYmdToDate(contents.invstEndYmd || ''),
  })

  async function clickModify() {
    const data = {
      ...portfolio,
      invstStartYmd: date?.from ? formatDateToYmd(date.from) : '',
      invstEndYmd: date?.to ? formatDateToYmd(date.to) : '',
    }
    const response = await modifyPortfolio(data)
    if (response.status === 200) {
      alert('수정되었습니다.')
      onBack()
    } else {
      alert(response.message)
    }
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return '';
    }
    return dateString.split(' ')[0];
  };

  return ( 
    <>
      <Table className={'border'}>
        <TableBody>

          <TableRow>
            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>등록일/수정일</TableCell>
            <TableCell className={'p-4'}>
              {portfolio.regDttm && `${formatDate(portfolio.regDttm)}`}
              {portfolio.edtDttm && ` / ${formatDate(portfolio.edtDttm)}`}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>공개</TableCell>
            <TableCell className={'p-4'}>
              <RadioGroup
                value={portfolio.openYn}
                className={'flex'}
                onValueChange={(e) => setPortfolio({ ...portfolio, openYn: e })}
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
            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>소속그룹</TableCell>
            <TableCell className={'p-4'}>
              {portfolio.resInvstStrategy?.invstName}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>제목</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                placeholder="제목"
                value={portfolio.periodName || ''}
                onChange={(e) => setPortfolio({ ...portfolio, periodName: e.target.value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>투자 기간</TableCell>
            <TableCell className={'p-4'}>
              <CommonDoubleCalendar date={date} setDate={setDate} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>지난 수익률</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                value={portfolio.lastEarningRate || ''}
                onChange={(e) => setPortfolio({ ...portfolio, lastEarningRate: e.target.value })}
              />
            </TableCell>
            <TableCell className={'font-bold pl-4 border-r-2'}>%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>누적 수익률</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                value={portfolio.accEarningRate || ''}
                onChange={(e) => setPortfolio({ ...portfolio, accEarningRate: e.target.value })}
              />
            </TableCell>
            <TableCell className={'font-bold pl-4 border-r-2'}>%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>3개월 수익률</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                value={portfolio.threeEarningRate || ''}
                onChange={(e) => setPortfolio({ ...portfolio, threeEarningRate: e.target.value })}
              />
            </TableCell>
            <TableCell className={'font-bold pl-4 border-r-2'}>%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>6개월 수익률</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                value={portfolio.sixEarningRate || ''}
                onChange={(e) => setPortfolio({ ...portfolio, sixEarningRate: e.target.value })}
              />
            </TableCell>
            <TableCell className={'font-bold pl-4 border-r-2'}>%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>12개월 수익률</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                value={portfolio.annEarningRate || ''}
                onChange={(e) => setPortfolio({ ...portfolio, annEarningRate: e.target.value })}
              />
            </TableCell>
            <TableCell className={'font-bold pl-4 border-r-2'}>%</TableCell>
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
        <h2 className="text-lg font-bold mb-4">포트폴리오 종목 상세</h2>
        <Table className={'border'}>
          <TableBody>
            <TableRow>
              <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>No</TableCell>
              <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>종목명</TableCell>
              <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>종목코드</TableCell>
              <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>시장</TableCell>
              <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>매수/매도</TableCell>
              <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>매수/매도가</TableCell>
              <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>목표가</TableCell>
              <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>비중</TableCell>
            </TableRow>
            {portfolio.resPortfolioStockList?.map((stock: PortfolioStock, index) => (
              <TableRow key={stock.portfolioStockUid}>
                <TableCell className={'p-4'}>{index + 1}</TableCell>
                <TableCell className={'p-4'}>{stock.stockName}</TableCell>
                <TableCell className={'p-4'}>{stock.stockCd}</TableCell>
                <TableCell className={'p-4'}>{stock.marketTp}</TableCell>
                <TableCell className={'p-4'}>{stock.tradeTp}</TableCell>
                <TableCell className={'p-4'}>{stock.tradePrice}</TableCell>
                <TableCell className={'p-4'}>{stock.goalPrice}</TableCell>
                <TableCell className={'p-4'}>{stock.weight}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
