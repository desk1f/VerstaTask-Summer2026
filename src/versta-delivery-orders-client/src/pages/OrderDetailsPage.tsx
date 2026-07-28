import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError, type Order, ordersApi } from '../api/orders'
import { StatusPanel } from '../components/StatusPanel'
import { formatDate, formatDateTimeUtc, formatWeight } from '../utils/format'

type LocationState = { created?: boolean } | null

export function OrderDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const locationState = location.state as LocationState
  const orderId = Number(id)
  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading')
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      setStatus('not-found')
      return
    }

    const controller = new AbortController()
    setStatus('loading')
    setError('')

    ordersApi.getById(orderId, controller.signal)
      .then(result => {
        setOrder(result)
        setStatus('ready')
      })
      .catch(requestError => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        if (requestError instanceof ApiError && requestError.status === 404) {
          setStatus('not-found')
          return
        }
        setError(requestError instanceof ApiError ? requestError.message : 'Не удалось загрузить заказ.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [orderId, requestVersion])

  if (status === 'loading') {
    return <StatusPanel title="Загружаем заказ" isLoading><p>Получаем сохранённые данные.</p></StatusPanel>
  }

  if (status === 'not-found') {
    return <StatusPanel title="Заказ не найден" action={<Link className="button button-secondary" to="/orders">Вернуться к списку</Link>}><p>Возможно, заказ с таким номером не существует.</p></StatusPanel>
  }

  if (status === 'error') {
    return <StatusPanel title="Не удалось загрузить заказ" tone="error" action={<button className="button button-secondary" type="button" onClick={() => setRequestVersion(version => version + 1)}>Повторить</button>}><p>{error}</p></StatusPanel>
  }

  if (!order) return null

  return (
    <div className="page-stack details-page">
      {locationState?.created && <div className="alert alert-success" role="status">Заказ успешно создан.</div>}
      <header className="page-heading heading-with-action">
        <div>
          <p className="eyebrow">Заказ сохранён</p>
          <h1>Заказ № {order.orderNumber}</h1>
          <p>Создан {formatDateTimeUtc(order.createdAtUtc)}</p>
        </div>
      </header>

      <div className="details-grid">
        <DetailsSection title="Отправитель" items={[
          ['Город', order.senderCity],
          ['Адрес', order.senderAddress],
        ]} />
        <DetailsSection title="Получатель" items={[
          ['Город', order.recipientCity],
          ['Адрес', order.recipientAddress],
        ]} />
        <DetailsSection title="Параметры груза" items={[
          ['Вес', formatWeight(order.weight)],
          ['Дата забора', formatDate(order.pickupDate)],
          ['Дата создания', formatDateTimeUtc(order.createdAtUtc)],
        ]} wide />
      </div>

      <div className="button-row details-actions">
        <Link className="button button-secondary" to="/orders">Вернуться к списку</Link>
        <Link className="button button-primary" to="/orders/new">Создать ещё заказ</Link>
      </div>
    </div>
  )
}

function DetailsSection({ title, items, wide = false }: { title: string, items: string[][], wide?: boolean }) {
  return (
    <section className={`details-section${wide ? ' details-section-wide' : ''}`}>
      <h2>{title}</h2>
      <dl>
        {items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
    </section>
  )
}
