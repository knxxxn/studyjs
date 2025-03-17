import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'

export default function CommonPage({
  page,
  setPage,
  pageSize,
}: {
  page: number
  setPage: Function
  pageSize: number
}) {
  function getPageRange(currentPage: number, totalPages: number, rangeSize = 5) {
    const halfRange = Math.floor(rangeSize / 2)
    let startPage = Math.max(0, currentPage - halfRange) // ✅ 0부터 시작하도록 조정
    let endPage = Math.min(totalPages - 1, startPage + rangeSize - 1)

    if (startPage === 0) {
      endPage = Math.min(totalPages - 1, rangeSize - 1)
    }

    if (endPage === totalPages - 1) {
      startPage = Math.max(0, totalPages - rangeSize)
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink onClick={() => setPage(0)}>{'<<'}</PaginationLink>
        </PaginationItem>
        {/*Array.from({ length: pageSize }, (_, index) => (*/}
        {Array.from(getPageRange(page, pageSize), (pageNumber, index) => (
          <PaginationItem key={index}>
            <PaginationLink onClick={() => setPage(pageNumber)} isActive={page === pageNumber}>
              {pageNumber + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationLink onClick={() => setPage(pageSize - 1)}>{'>>'}</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
