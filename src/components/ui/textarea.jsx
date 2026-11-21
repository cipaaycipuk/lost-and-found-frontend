import * as React from "react"
import { cn } from "cn"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-lg border-0 bg-[#EFEFEF] px-3.5 py-3 text-sm text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:bg-[#E6E6E6] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
