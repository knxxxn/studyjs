import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

export default function CommonCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id="date" variant={'outline'}>
          <CalendarIcon />
          {date ? format(date, 'y년 MM월 dd일') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
      </PopoverContent>
    </Popover>
  )
}
