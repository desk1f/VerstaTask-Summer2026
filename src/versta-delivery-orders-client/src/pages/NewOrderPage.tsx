import { type ChangeEvent, type FormEvent, type ReactNode, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, ordersApi } from '../api/orders'

type FormValues = {
  senderCity: string
  senderAddress: string
  recipientCity: string
  recipientAddress: string
  weight: string
  pickupDate: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  senderCity: '',
  senderAddress: '',
  recipientCity: '',
  recipientAddress: '',
  weight: '',
  pickupDate: '',
}

const fieldNames = new Set<keyof FormValues>(Object.keys(initialValues) as (keyof FormValues)[])

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  const requiredText: Array<[keyof FormValues, string, number]> = [
    ['senderCity', 'Укажите город отправителя.', 100],
    ['senderAddress', 'Укажите адрес отправителя.', 250],
    ['recipientCity', 'Укажите город получателя.', 100],
    ['recipientAddress', 'Укажите адрес получателя.', 250],
  ]

  for (const [field, message, maxLength] of requiredText) {
    if (!values[field].trim()) {
      errors[field] = message
    } else if (values[field].trim().length > maxLength) {
      errors[field] = `Допустимо не более ${maxLength} символов.`
    }
  }

  const weight = Number(values.weight)
  if (!values.weight) {
    errors.weight = 'Укажите вес груза.'
  } else if (!Number.isFinite(weight) || weight <= 0) {
    errors.weight = 'Вес должен быть больше нуля.'
  }

  if (!values.pickupDate) {
    errors.pickupDate = 'Укажите дату забора груза.'
  }

  return errors
}

function focusFirstInvalidField(errors: FormErrors) {
  const firstField = Object.keys(errors)[0]
  if (firstField) requestAnimationFrame(() => document.getElementById(firstField)?.focus())
}

export function NewOrderPage() {
  const navigate = useNavigate()
  const submissionLock = useRef(false)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as keyof FormValues
    setValues(current => ({ ...current, [field]: event.target.value }))
    setErrors(current => ({ ...current, [field]: undefined }))
    setGeneralError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submissionLock.current) return

    const clientErrors = validate(values)
    setErrors(clientErrors)
    setGeneralError('')
    if (Object.keys(clientErrors).length > 0) {
      focusFirstInvalidField(clientErrors)
      return
    }

    submissionLock.current = true
    setIsSubmitting(true)

    try {
      const order = await ordersApi.create({
        senderCity: values.senderCity.trim(),
        senderAddress: values.senderAddress.trim(),
        recipientCity: values.recipientCity.trim(),
        recipientAddress: values.recipientAddress.trim(),
        weight: Number(values.weight),
        pickupDate: values.pickupDate,
      })
      navigate(`/orders/${order.id}`, { state: { created: true } })
    } catch (error) {
      if (error instanceof ApiError) {
        const backendErrors: FormErrors = {}
        for (const [field, messages] of Object.entries(error.validationErrors)) {
          if (fieldNames.has(field as keyof FormValues) && messages[0]) {
            backendErrors[field as keyof FormValues] = messages[0]
          }
        }
        setErrors(current => ({ ...current, ...backendErrors }))
        if (Object.keys(backendErrors).length === 0) {
          setGeneralError(error.message)
        } else {
          focusFirstInvalidField(backendErrors)
        }
      } else {
        setGeneralError('Произошла непредвиденная ошибка. Попробуйте ещё раз.')
      }
    } finally {
      submissionLock.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack form-page">
      <header className="page-heading">
        <p className="eyebrow">Новый заказ</p>
        <h1>Оформление доставки</h1>
        <p>Все поля обязательны для заполнения.</p>
      </header>

      <form className="order-form" onSubmit={handleSubmit} noValidate>
        {generalError && <div className="alert alert-error" role="alert">{generalError}</div>}

        <FormSection title="Отправитель">
          <TextField label="Город отправителя" name="senderCity" value={values.senderCity} error={errors.senderCity} maxLength={100} onChange={handleChange} />
          <TextField label="Адрес отправителя" name="senderAddress" value={values.senderAddress} error={errors.senderAddress} maxLength={250} onChange={handleChange} />
        </FormSection>

        <FormSection title="Получатель">
          <TextField label="Город получателя" name="recipientCity" value={values.recipientCity} error={errors.recipientCity} maxLength={100} onChange={handleChange} />
          <TextField label="Адрес получателя" name="recipientAddress" value={values.recipientAddress} error={errors.recipientAddress} maxLength={250} onChange={handleChange} />
        </FormSection>

        <FormSection title="Параметры груза">
          <TextField label="Вес груза, кг" name="weight" value={values.weight} error={errors.weight} type="number" min="0.01" step="0.01" onChange={handleChange} />
          <TextField label="Дата забора груза" name="pickupDate" value={values.pickupDate} error={errors.pickupDate} type="date" onChange={handleChange} />
        </FormSection>

        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? 'Сохраняем…' : 'Сохранить заказ'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormSection({ title, children }: { title: string, children: ReactNode }) {
  return (
    <fieldset className="form-section">
      <legend>{title}</legend>
      <div className="field-grid">{children}</div>
    </fieldset>
  )
}

type TextFieldProps = {
  label: string
  name: keyof FormValues
  value: string
  error?: string
  type?: 'text' | 'number' | 'date'
  maxLength?: number
  min?: string
  step?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function TextField({ label, name, value, error, type = 'text', ...inputProps }: TextFieldProps) {
  const errorId = `${name}-error`
  return (
    <div className="form-field">
      <label htmlFor={name}>{label} <span aria-hidden="true">*</span></label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && <span className="field-error" id={errorId}>{error}</span>}
    </div>
  )
}
