import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InvestStrategy } from '@/interfaces/interface.invest.strategy';

interface InvestStrategyRegistTableProps {
  contents: InvestStrategy;
  setContents: (contents: InvestStrategy) => void;
  handleRegist: () => void;
}

export default function InvestStrategyRegistTable({
  contents,
  setContents,
  handleRegist,
}: InvestStrategyRegistTableProps) {
  return (
    <Table className={'border'}>
      <TableBody>
        <TableRow>
          <TableCell className={'font-bold pl-4 border-r-2'}>공개 여부</TableCell>
          <TableCell className={'p-4'}>
            <RadioGroup
              value={contents.openYn}
              className={'flex'}
              onValueChange={(e) => setContents({ ...contents, openYn: e })}
            >
              <span className={'flex items-center mr-4'}>
                <RadioGroupItem value="Y" id="open" className={'mr-1'} />
                <Label htmlFor="open">공개</Label>
              </span>
              <span className={'flex items-center mr-4'}>
                <RadioGroupItem value="N" id="close" className={'mr-1'} />
                <Label htmlFor="close">비공개</Label>
              </span>
            </RadioGroup>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold pl-4 border-r-2'}>그룹명</TableCell>
          <TableCell className={'p-4'}>
            <Input
              type="text"
              value={contents.invstName}
              onChange={(e) => setContents({ ...contents, invstName: e.target.value })}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold pl-4 border-r-2'}>주기</TableCell>
          <TableCell className={'p-4'}>
            <Input
              type="number"
              value={contents.weekPeriod}
              onChange={(e) => setContents({ ...contents, weekPeriod: Number(e.target.value) })}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold pl-4 border-r-2'}>통화</TableCell>
          <TableCell className={'p-4'}>
            <Input
              type="text"
              value={contents.currency}
              onChange={(e) => setContents({ ...contents, currency: e.target.value })}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold pl-4 border-r-2'}>무료 노출 수</TableCell>
          <TableCell className={'p-4'}>
            <Input
              type="number"
              value={contents.freeShowCnt}
              onChange={(e) => setContents({ ...contents, freeShowCnt: Number(e.target.value) })}
            />
          </TableCell>
        </TableRow>
      </TableBody>
      <tfoot>
        <tr>
          <td colSpan={2}>
            <div className={'flex justify-center w-full mt-4'}>
              <Button className={'w-1/6'} onClick={handleRegist}>
                등록
              </Button>
            </div>
          </td>
        </tr>
      </tfoot>
    </Table>
  );
}