import dynamic from 'next/dynamic'
import CommonLoading from '@/components/common/CommonLoading'
import { redirect } from 'next/navigation'
import { getBanner } from '@/api/api.banner'

interface Props {
  params: {
    bannerUid: string
  }
}

const BannerDetailBody = dynamic(() => import('./page.body'), {
  loading: () => <CommonLoading />,
})

export default async function BannerDetail({ params }: Props) {
  const { bannerUid } = await params
  const response = await getBanner(bannerUid)

  if (response.status === 422) {
    redirect('/error/500')
  }
  if (!response) {
    redirect('/error/500')
  }

  return (
    <>
      <BannerDetailBody contents={response.data} />
    </>
  )
}
