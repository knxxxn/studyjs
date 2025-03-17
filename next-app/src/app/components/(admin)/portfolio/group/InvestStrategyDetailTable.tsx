import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { InvestStrategy } from '@/interfaces/interface.invest.strategy';

interface InvestStrategyDetailTableProps {
  contents: InvestStrategy;
}

export default function InvestStrategyDetailTable({ contents }: InvestStrategyDetailTableProps) {;

  return (
    <Table className={'border'}>
      <TableBody>
      <TableRow>
          <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>등록일</TableCell>
          <TableCell className={'p-4'}>{contents.regDate}</TableCell>
        </TableRow>
        <TableRow>
        <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>수정일</TableCell>
        <TableCell className={'p-4'}>{contents.modDate}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>공개 여부</TableCell>
          <TableCell className={'p-4'}>{contents.openYn === 'Y' ? '공개' : '비공개'}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>그룹 코드</TableCell>
          <TableCell className={'p-4'}>{contents.invstFormCd}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>그룹명</TableCell>
          <TableCell className={'p-4'}>{contents.invstName}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>주기</TableCell>
          <TableCell className={'p-4'}>{contents.weekPeriod}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>통화</TableCell>
          <TableCell className={'p-4'}>{contents.currency}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>무료 노출 수</TableCell>
          <TableCell className={'p-4'}>{contents.freeShowCnt}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>타입</TableCell>
          <TableCell className={'p-4'}>{contents.invstTp === 'N' ? '무료' : '유료'}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}