import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function TextField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  inputMode,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        className={cn(
          'h-11 rounded-lg border-0 bg-[#EFEFEF] px-3.5 text-sm focus:bg-[#E6E6E6]',
          error ? 'bg-red-50/80 text-red-900 placeholder:text-red-400' : ''
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
