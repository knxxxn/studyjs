import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'

export default function CommonDoubleCalendar({
  date,
  setDate,
}: {
  date: DateRange | undefined
  setDate: Function
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id="date" variant={'outline'}>
          <CalendarIcon />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'y년 MM월 dd일')} ~ {format(date.to, 'y년 MM월 dd일')}
              </>
            ) : (
              format(date.from, 'y년 MM월 dd일')
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          selected={date}
          onSelect={(e) => setDate(e)}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
