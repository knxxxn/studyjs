import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ServiceList } from '@/constants/CommonConstants'
import { Fragment, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Banner } from '@/interfaces/interface.banner'
import { DateRange } from 'react-day-picker'
import { undefined } from 'zod'
import { addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import useLink from '@/hooks/useLink'
import { formatDateToYmd } from '@/utils/commonUtil'
import { fileUpload } from '@/api/api.common'
import { ResponseType } from '@/interfaces/interface.common'
import { addBanner } from '@/api/api.banner'
import CommonDoubleCalendar from '@/components/common/CommonDoubleCalendar'

export default function BannerRegistTable() {
  const { onBack } = useLink()

  const [banner, setBanner] = useState<Banner>({
    bannerImage: '',
    bannerUid: null,
    channelCd: '',
    cnt: 0,
    contents: '',
    linkUrl: '',
    modDate: null,
    openDate: '',
    openYn: 'Y',
    ord: 1,
    ratio: '',
    regDate: null,
    showEndDate: '',
    showEndTime: '2359',
    showStartDate: '',
    showStartTime: '0000',
    standard: '',
    stockName: '',
    userLevel: 'A',
  })

  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const [channelCd, setChannelCd] = useState<string[]>(
    ServiceList.map((service) => service.channelCd),
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [lastTerm, setLastTerm] = useState(true)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] // 첫 번째 파일 가져오기

    if (file) {
      setSelectedFile(file)
    }
  }

  function allChannelCdCheck() {
    if (channelCd.length === ServiceList.length) {
      setChannelCd([])
    } else {
      const arr = ServiceList.map((channel) => channel.channelCd)
      setChannelCd(arr)
    }
  }

  function channelCdCheck(channel: string) {
    if (channelCd.includes(channel)) {
      setChannelCd(channelCd.filter((id) => id !== channel))
    } else {
      setChannelCd([...channelCd, channel])
    }
  }

  async function imageUpload() {
    const formData = new FormData()
    formData.append('file', selectedFile as Blob)
    formData.append('path', 'upload/img/main_banner/')

    return await fileUpload(formData)
  }

  async function clickRegist() {
    let uploadUrl = null
    if (selectedFile !== null) {
      const response: ResponseType = await imageUpload()
      if (response.status === 200) {
        uploadUrl = response.data
      } else {
        alert(response.message)
        return
      }
    }
    const channelList = ServiceList.length === channelCd.length ? [...channelCd, 'A'] : channelCd
    const data = {
      ...banner,
      showStartDate: formatDateToYmd(date!.from!),
      showEndDate: lastTerm ? '99991231' : formatDateToYmd(date!.to!),
      channelCd: channelList.join(),
      bannerImage: uploadUrl,
    }

    const response = await addBanner(data)
    if (response.status === 200) {
      alert('등록되었습니다.')
      onBack()
    }
  }

  return (
    <>
      <Table className={'border'}>
        <TableBody>
          <TableRow>
            <TableCell className={'font-bold min-w-32 pl-4 border-r-2'}>공개</TableCell>
            <TableCell className={'p-4'}>
              <RadioGroup
                value={banner.openYn!}
                className={'flex'}
                onValueChange={(e) => setBanner({ ...banner, openYn: e })}
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
            <TableCell className={'font-bold pl-4 border-r-2'}>노출기간</TableCell>
            <TableCell className={'p-4'}>
              <CommonDoubleCalendar date={date} setDate={setDate} />
              <Checkbox
                id={'lastTerm'}
                className={'mr-1 ml-2'}
                checked={lastTerm}
                onCheckedChange={() => setLastTerm(!lastTerm)}
              />
              <label htmlFor={'lastTerm'}>노출기간 비설정</label>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>노출대상</TableCell>
            <TableCell className={'p-4'}>
              <RadioGroup
                defaultValue="A"
                className={'flex'}
                onValueChange={(e) => setBanner({ ...banner, userLevel: e })}
              >
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="A" id="t1" className={'mr-1'} />
                  <Label htmlFor="t1">전체</Label>
                </span>
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="01" id="t2" className={'mr-1'} />
                  <Label htmlFor="t2">무료</Label>
                </span>
                <span className={'flex items-center mr-4'}>
                  <RadioGroupItem value="02" id="t3" className={'mr-1'} />
                  <Label htmlFor="t3">유료</Label>
                </span>
              </RadioGroup>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>노출채널</TableCell>
            <TableCell className={'p-4'}>
              <Checkbox
                id={'p0'}
                className={'mr-1'}
                checked={channelCd.length === ServiceList.length}
                onCheckedChange={allChannelCdCheck}
              />
              <label htmlFor={'p0'} className={'mr-4'}>
                전체
              </label>
              {ServiceList.map((item, index) => (
                <Fragment key={item.channelCd}>
                  <Checkbox
                    id={`p${index}`}
                    className={'mr-1'}
                    checked={channelCd.includes(item.channelCd)}
                    onCheckedChange={() => channelCdCheck(item.channelCd)}
                  />
                  <label htmlFor={`p${index}`} className={'mr-4'}>
                    {item.name}
                  </label>
                </Fragment>
              ))}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>배너명</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                placeholder="배너명을 입력하세요."
                value={banner.stockName!}
                onChange={(e) => setBanner({ ...banner, stockName: e.target.value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>배너 이미지</TableCell>
            <TableCell className={'p-4'}>
              <Input type="file" onChange={handleFileChange} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>링크 URL</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="text"
                placeholder="URL을 입력하세요."
                value={banner.linkUrl!}
                onChange={(e) => setBanner({ ...banner, linkUrl: e.target.value })}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'font-bold pl-4 border-r-2'}>노출순서</TableCell>
            <TableCell className={'p-4'}>
              <Input
                type="number"
                value={banner.ord!}
                onChange={(e) => setBanner({ ...banner, ord: Number(e.target.value) })}
              />
              <div className={'mt-4'}>
                * 숫자가 낮을수록 먼저 나오게 됩니다.
                <br />* 노출 순서가 동일한 경우 최근 등록된 배너 순으로 노출됩니다.
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className={'flex justify-center w-full mt-4'}>
        <Button className={'w-1/6 mr-4'} onClick={clickRegist}>
          등록
        </Button>
        <Button className={'w-1/6'} onClick={() => onBack()}>
          취소
        </Button>
      </div>
    </>
  )
}
