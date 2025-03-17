import { Button } from '@/components/ui/button'

export default function TableControlButton({
  registFunction,
  removeFunction,
}: {
  registFunction: Function
  removeFunction: Function
}) {
  return (
    <>
      <Button
        className={'w-1/12 bg-green-500 hover:bg-green-600 mr-4'}
        onClick={() => registFunction()}
      >
        등록
      </Button>
      <Button className={'w-1/12'} onClick={() => removeFunction()}>
        삭제
      </Button>
    </>
  )
}
