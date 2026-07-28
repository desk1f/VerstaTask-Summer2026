export type CreateOrderRequest = {
  senderCity: string
  senderAddress: string
  recipientCity: string
  recipientAddress: string
  weight: number
  pickupDate: string
}

export type Order = CreateOrderRequest & {
  id: number
  orderNumber: string
  createdAtUtc: string
}

type ValidationProblem = {
  title?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly validationErrors: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    validationErrors: Record<string, string[]> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.validationErrors = validationErrors
  }
}

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...init?.headers,
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.', 0)
  }

  if (!response.ok) {
    let problem: ValidationProblem | undefined
    try {
      problem = await response.json() as ValidationProblem
    } catch {
      problem = undefined
    }

    const fallback = response.status === 404
      ? 'Заказ не найден.'
      : 'Сервер не смог выполнить запрос.'

    throw new ApiError(problem?.title || fallback, response.status, problem?.errors)
  }

  return response.json() as Promise<T>
}

export const ordersApi = {
  create(order: CreateOrderRequest): Promise<Order> {
    return request<Order>('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
  },

  getAll(signal?: AbortSignal): Promise<Order[]> {
    return request<Order[]>('/api/orders', { signal })
  },

  getById(id: number, signal?: AbortSignal): Promise<Order> {
    return request<Order>(`/api/orders/${id}`, { signal })
  },
}
