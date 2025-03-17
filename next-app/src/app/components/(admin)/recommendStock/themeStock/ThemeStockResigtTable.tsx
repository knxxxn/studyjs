'use client'

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeStock } from '@/interfaces/interface.recommend.stock'
import { ChangeEvent, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import * as XLSX from 'xlsx';
import { types } from 'util'


interface ThemeStockRegistTableProps {
  contents: ThemeStock
  setContents: (contents: ThemeStock) => void
  handleRegist: () => void
}

export default function ThemeStockRegistTable({
  contents,
  setContents,
  handleRegist,
}: ThemeStockRegistTableProps) {
  const [excelData, setExcelData] = useState<any[]>([]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryString = event.target?.result;
        if (typeof binaryString === 'string') {
          const workbook = XLSX.read(binaryString, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet);
          setExcelData(data);
        }
      };
      reader.readAsBinaryString(file);
    }

  }
  console.log(excelData[0])
  console.log(excelData)

  return (
    <Table className={'border'}>
      <TableBody>
        <TableRow>
          <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>공개</TableCell>
          <TableCell className={'p-4'}>
            <RadioGroup
              value={contents.openYn}
              className={'flex'}
              onValueChange={(e) => setContents({ ...contents, openYn: e })}
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
              value={contents.theme || ''}
              onChange={(e) => setContents({ ...contents, theme: e.target.value })}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold pl-4 border-r-2'}>테마소개</TableCell>
          <TableCell className={'p-4'}>
            <Textarea
              value={contents.themeInfo || ''}
              onChange={(e) => setContents({ ...contents, themeInfo: e.target.value })}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={'font-bold pl-4 border-r-2'}>엑셀 업로드</TableCell>
          <TableCell className={'p-4'}>
            <Input
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
            />
          </TableCell>
        </TableRow>
        {excelData.length > 0 ? (
          <TableRow>
            <TableCell colSpan={2}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {excelData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td
                            key={cellIndex}
                            style={{ border: '1px solid #ddd', padding: '8px' }}
                          >
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TableCell>
          </TableRow>
        ) : null}
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