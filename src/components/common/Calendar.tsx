import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ko } from "date-fns/locale"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// cn 함수 직접 정의
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ko}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4",
        month: "space-y-4 relative",
        caption: "flex justify-center items-center relative min-h-8 pt-4",
        caption_label: "text-sm font-medium",
        nav: "flex items-center justify-between absolute w-full top-4 left-0 right-0 px-2",
        nav_button:
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded border border-gray-200",
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: "h-9 w-9 p-0 font-normal hover:bg-gray-100 rounded cursor-pointer",
        day_selected:
          "bg-gray-800 text-white hover:bg-gray-800",
        day_today: "bg-gray-100 font-bold",
        day_outside: "text-gray-300",
        day_disabled: "text-gray-300 opacity-50",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
