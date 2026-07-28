import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, type Order, ordersApi } from '../api/orders'
import { StatusPanel } from '../components/StatusPanel'
import { formatDate, formatDateTimeUtc, formatWeight } from '../utils/format'

export function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError('')

    ordersApi.getAll(controller.signal)
      .then(setOrders)
      .catch(requestError => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError instanceof ApiError ? requestError.message : 'Не удалось загрузить заказы.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [requestVersion])

  function openOrder(id: number) {
    navigate(`/orders/${id}`)
  }

  return (
    <div className="page-stack orders-page">
      <header className="page-heading heading-with-action">
        <div>
          <p className="eyebrow">История заказов</p>
          <h1>Заказы</h1>
          <p>Все сохранённые заказы в порядке создания.</p>
        </div>
        <Link className="button button-primary" to="/orders/new">Новый заказ</Link>
      </header>

      {isLoading && <StatusPanel title="Загружаем заказы"><p>Это займёт совсем немного времени.</p></StatusPanel>}

      {!isLoading && error && (
        <StatusPanel title="Не удалось загрузить заказы" tone="error" action={
          <button className="button button-secondary" type="button" onClick={() => setRequestVersion(version => version + 1)}>Повторить</button>
        }>
          <p>{error}</p>
        </StatusPanel>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <StatusPanel title="Заказов пока нет" action={<Link className="button button-primary" to="/orders/new">Создать первый заказ</Link>}>
          <p>Оформите первый заказ — он появится здесь сразу после сохранения.</p>
        </StatusPanel>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <>
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr><th>Номер</th><th>Отправитель</th><th>Получатель</th><th>Вес</th><th>Дата забора</th><th>Создан</th><th><span className="visually-hidden">Действие</span></th></tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} tabIndex={0} onClick={() => openOrder(order.id)} onKeyDown={event => { if (event.key === 'Enter') openOrder(order.id) }}>
                    <td><strong>№ {order.orderNumber}</strong></td>
                    <td><span>{order.senderCity}</span><small>{order.senderAddress}</small></td>
                    <td><span>{order.recipientCity}</span><small>{order.recipientAddress}</small></td>
                    <td>{formatWeight(order.weight)}</td>
                    <td>{formatDate(order.pickupDate)}</td>
                    <td>{formatDateTimeUtc(order.createdAtUtc)}</td>
                    <td><Link className="table-action" to={`/orders/${order.id}`} onClick={event => event.stopPropagation()}>Открыть</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-cards">
            {orders.map(order => (
              <Link className="order-card" to={`/orders/${order.id}`} key={order.id}>
                <div className="order-card-heading"><strong>Заказ № {order.orderNumber}</strong><span>Открыть</span></div>
                <dl>
                  <div><dt>Маршрут</dt><dd>{order.senderCity} → {order.recipientCity}</dd></div>
                  <div><dt>Вес</dt><dd>{formatWeight(order.weight)}</dd></div>
                  <div><dt>Дата забора</dt><dd>{formatDate(order.pickupDate)}</dd></div>
                </dl>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
