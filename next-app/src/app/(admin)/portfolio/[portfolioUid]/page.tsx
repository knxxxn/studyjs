import dynamic from 'next/dynamic'
import CommonLoading from '@/components/common/CommonLoading'
import { redirect } from 'next/navigation'
import { getPortfolio } from '@/api/api.invest.strategy'

interface Props {
  params: {
    portfolioUid: string
  }
}

const PortfolioDetailBody = dynamic(() => import('./page.body'), {
  loading: () => <CommonLoading />,
})

export default async function PortfolioDetail({ params }: Props) {
  const { portfolioUid } = await params
  const response = await getPortfolio(portfolioUid)

  if (response.status === 422) {
    redirect('/error/500')
  }
  if (!response) {
    redirect('/error/500')
  }

  return (
    <>
      <PortfolioDetailBody contents={response.data} />
    </>
  )
}
