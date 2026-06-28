import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`ui-field order-field ${className}`.trim()}>
      <label className="ui-field__label order-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="ui-field__hint">{hint}</p>}
      {error && <p className="ui-field__error order-field__error" role="alert">{error}</p>}
    </div>
  )
}

export function FormError({ message }: { message: string }) {
  return (
    <p className="ui-field__error order-field__error" role="alert">
      {message}
    </p>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError, className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`ui-input order-field__input${hasError ? ' ui-input--error order-field__input--error' : ''} ${className}`.trim()}
      {...rest}
    />
  )
})

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }

export function Select({ hasError, className = '', ...rest }: SelectProps) {
  return (
    <select
      className={`ui-select order-field__input${hasError ? ' ui-input--error order-field__input--error' : ''} ${className}`.trim()}
      {...rest}
    />
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }

export function Textarea({ hasError, className = '', ...rest }: TextareaProps) {
  return (
    <textarea
      className={`ui-textarea order-field__input order-field__textarea${hasError ? ' ui-input--error order-field__input--error' : ''} ${className}`.trim()}
      {...rest}
    />
  )
}
