import * as React from 'react'
import { Eye, EyeOff, Copy, Check, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  autoGenerate?: boolean
  syncConfirmField?: (password: string) => void
}

const generatePassword = (length = 12) => {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { className, autoGenerate = false, syncConfirmField, onChange, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [password, setPassword] = React.useState('')
    const [copied, setCopied] = React.useState(false)

    React.useEffect(() => {
      if (autoGenerate) {
        const newPassword = generatePassword()
        setPassword(newPassword)
        syncConfirmField?.(newPassword)
        onChange?.({
          target: { value: newPassword },
        } as React.ChangeEvent<HTMLInputElement>)
      }
    }, [autoGenerate])

    const handleGeneratePassword = () => {
      const newPassword = generatePassword()
      setPassword(newPassword)
      syncConfirmField?.(newPassword)
      onChange?.({
        target: { value: newPassword },
      } as React.ChangeEvent<HTMLInputElement>)
    }

    const handleCopyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(password)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        alert('Failed to copy password.')
      }
    }

    return (
      <div className='relative rounded-md'>
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            `border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50`,
            className
          )}
          ref={ref}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            onChange?.(e)
          }}
          {...props}
        />
        <div className='absolute top-1/2 right-1 flex -translate-y-1/2 items-center space-x-1'>
          <Button
            type='button'
            size='icon'
            variant='ghost'
            className='text-muted-foreground h-6 w-6 rounded-md'
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </Button>

          {autoGenerate && (
            <>
              <Button
                type='button'
                size='icon'
                variant='ghost'
                className='group text-muted-foreground relative h-6 w-6 rounded-md'
                onClick={handleCopyToClipboard}
              >
                {/* Show check icon if copied */}
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {/* Popover */}
                <span
                  className={cn(
                    'bg-muted-foreground absolute top-full mt-1 hidden rounded-md p-1 text-xs text-white group-hover:block',
                    copied ? 'block' : ''
                  )}
                >
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </span>
              </Button>
              <Button
                type='button'
                size='icon'
                variant='ghost'
                className='text-muted-foreground h-6 w-6 rounded-md'
                onClick={handleGeneratePassword}
              >
                <RefreshCcw size={18} />
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
