import dynamic from 'next/dynamic'
import CommonLoading from '@/components/common/CommonLoading'

const BannerBody = dynamic(() => import('./page.body'), {
  loading: () => <CommonLoading />,
})

export default async function Banner() {
  return (
    <>
      <BannerBody />
    </>
  )
}
