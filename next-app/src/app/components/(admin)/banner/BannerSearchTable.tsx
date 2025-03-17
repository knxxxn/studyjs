import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { formatDateToYmdHyphen } from '@/utils/commonUtil'
import CommonDoubleCalendar from '@/components/common/CommonDoubleCalendar'

export default function BannerSearchTable({ searchFunc }: { searchFunc: Function }) {
  const [search, setSearch] = useState({
    openYn: 'ALL',
    stockName: '',
    type: 'ALL',
  })

  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  useEffect(() => {
    clickSearch()
  }, [])

  function clickSearch() {
    const data = {
      ...search,
      startDate: formatDateToYmdHyphen(date!.from!),
      endDate: formatDateToYmdHyphen(date!.to!),
    }
    searchFunc(data)
  }

  return (
    <>
      <Table className={'border'}>
        <TableBody>
          <TableRow>
            <TableCell className={'font-bold min-w-20 pl-4 border-r-2'}>공개</TableCell>
            <TableCell className={'min-w-96 p-4'}>
              <RadioGroup
                defaultValue="ALL"
                className={'flex'}
                onValueChange={(e) => setSearch({ ...search, openYn: e })}
              >
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="ALL" id="r1" className={'mr-1'} />
                  <Label htmlFor="r1">전체</Label>
                </span>
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="Y" id="r2" className={'mr-1'} />
                  <Label htmlFor="r2">Y</Label>
                </span>
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="N" id="r3" className={'mr-1'} />
                  <Label htmlFor="r3">N</Label>
                </span>
              </RadioGroup>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>검색어</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                placeholder="검색어를 입력하세요."
                value={search.stockName}
                onChange={(e) => setSearch({ ...search, stockName: e.target.value })}
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
                  <RadioGroupItem value="regDate" id="t2" className={'mr-1'} />
                  <Label htmlFor="t2">등록일</Label>
                </span>
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="modDate" id="t3" className={'mr-1'} />
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
  )
}
