import dynamic from 'next/dynamic'
import CommonLoading from '@/components/common/CommonLoading'

const BannerRegistBody = dynamic(() => import('./page.body'), {
  loading: () => <CommonLoading />,
})

export default async function BannerRegist() {
  return (
    <>
      <BannerRegistBody />
    </>
  )
}
