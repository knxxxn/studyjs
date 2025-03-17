import dynamic from 'next/dynamic'
import CommonLoading from '@/components/common/CommonLoading'

const PortfoiloBody = dynamic(() => import('./page.body'), {
  loading: () => <CommonLoading />,
})

export default async function Portfolio() {
  return (
    <>
      <PortfoiloBody />
    </>
  )
}
