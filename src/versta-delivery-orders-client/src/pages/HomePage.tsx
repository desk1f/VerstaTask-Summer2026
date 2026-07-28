import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero-section" aria-labelledby="home-title">
        <p className="eyebrow">Доставка без лишних шагов</p>
        <h1 id="home-title">Оформите заказ на доставку</h1>
        <p className="lead">Укажите отправителя, получателя и параметры груза — заказ сохранится и получит уникальный номер.</p>
        <div className="button-row">
          <Link className="button button-primary" to="/orders/new">Оформить заказ</Link>
          <Link className="button button-secondary" to="/orders">Посмотреть заказы</Link>
        </div>
      </section>

      <section className="steps-section" aria-labelledby="steps-title">
        <h2 id="steps-title">Как это работает</h2>
        <ol className="steps-list">
          <li><span>1</span><strong>Заполните данные.</strong></li>
          <li><span>2</span><strong>Сохраните заказ.</strong></li>
          <li><span>3</span><strong>Откройте его в списке.</strong></li>
        </ol>
      </section>
    </div>
  )
}
