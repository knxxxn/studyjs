import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Banner } from '@/interfaces/interface.banner'
import { getYmd } from '@/utils/commonUtil'
import useLink from '@/hooks/useLink'
import CommonPage from '@/components/common/CommonPage'
import { useEffect, useState } from 'react'

export default function BannerList({
  bannerList,
  selectedRows,
  setSelectedRows,
}: {
  bannerList: Banner[]
  selectedRows: number[]
  setSelectedRows: Function
}) {
  const { onLink } = useLink()
  const [pageSize, setPageSize] = useState(
    Math.floor(bannerList.length / 10) + (bannerList.length % 10 === 0 ? 0 : 1),
  )
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPageSize(Math.floor(bannerList.length / 10) + (bannerList.length % 10 === 0 ? 0 : 1))
  }, [bannerList])

  // 전체 체크 핸들러
  const handleSelectAll = () => {
    if (selectedRows.length === bannerList.length) {
      setSelectedRows([]) // 전체 선택 해제
    } else {
      setSelectedRows(bannerList.map((item) => item.bannerUid!)) // 전체 선택
    }
  }

  // 개별 체크 핸들러
  const handleSelectRow = (bannerUid: number) => {
    if (selectedRows.includes(bannerUid)) {
      setSelectedRows(selectedRows.filter((id) => id !== bannerUid)) // 선택 해제
    } else {
      setSelectedRows([...selectedRows, bannerUid]) // 선택 추가
    }
  }

  return (
    <>
      <Table className={'border'}>
        <TableHeader>
          <TableRow className={'text-center'}>
            <TableHead className="text-center">
              <input
                type="checkbox"
                checked={selectedRows.length === bannerList.length}
                onChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className={'text-center'}>No</TableHead>
            <TableHead className={'text-center'}>공개</TableHead>
            <TableHead className={'text-center'}>배너명</TableHead>
            <TableHead className={'text-center'}>이미지</TableHead>
            <TableHead className={'text-center'}>노출순서</TableHead>
            <TableHead className={'text-center'}>등록일</TableHead>
            <TableHead className={'text-center'}>수정일</TableHead>
            <TableHead className={'text-center'}>조회수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bannerList.slice(page * 10, (page + 1) * 10).map((item, index) => (
            <TableRow key={item.bannerUid} onClick={() => onLink(`/banner/${item.bannerUid}`)}>
              <TableCell className="text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(item.bannerUid!)}
                  onClick={(e) => e.stopPropagation()} // 클릭 이벤트 전파 중단
                  onChange={(e) => {
                    handleSelectRow(item.bannerUid!)
                  }}
                />
              </TableCell>
              <TableCell className={'text-center'}>{page * 10 + index + 1}</TableCell>
              <TableCell className={'text-center'}>{item.openYn}</TableCell>
              <TableCell className={'text-center'}>{item.stockName}</TableCell>
              <TableCell className={'text-center'}>
                {item.bannerImage !== null ? (
                  <img
                    src={item.bannerImage}
                    alt={'img'}
                    style={{ width: '70px', height: '50px' }}
                  />
                ) : (
                  <></>
                )}
              </TableCell>
              <TableCell className={'text-center'}>{item.ord}</TableCell>
              <TableCell className={'text-center'}>{getYmd(item.regDate)}</TableCell>
              <TableCell className={'text-center'}>{getYmd(item.modDate)}</TableCell>
              <TableCell className={'text-center'}>{item.cnt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={'mt-4'}>
        <CommonPage page={page} setPage={setPage} pageSize={pageSize} />
      </div>
    </>
  )
}
