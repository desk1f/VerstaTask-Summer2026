import { NavLink, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { NewOrderPage } from './pages/NewOrderPage'
import './App.css'

type PlaceholderPageProps = {
  title: string
  description: string
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="page-intro" aria-labelledby="page-title">
      <p className="eyebrow">Versta Delivery</p>
      <h1 id="page-title">{title}</h1>
      <p>{description}</p>
    </section>
  )
}

function NotFoundPage() {
  return <PlaceholderPage title="Страница не найдена" description="Проверьте адрес или перейдите в нужный раздел через навигацию." />
}

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-content">
          <NavLink className="brand" to="/">Versta Delivery</NavLink>
          <nav aria-label="Основная навигация">
            <ul className="navigation">
              <li><NavLink to="/" end>Главная</NavLink></li>
              <li><NavLink to="/orders/new">Новый заказ</NavLink></li>
              <li><NavLink to="/orders">Заказы</NavLink></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
          <Route path="/orders" element={<PlaceholderPage title="Заказы" description="Список оформленных заказов будет доступен после подключения API." />} />
          <Route path="/orders/:id" element={<PlaceholderPage title="Просмотр заказа" description="Детали заказа будут доступны после подключения API." />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container">Учебное приложение для приёмки заказов на доставку</div>
      </footer>
    </div>
  )
}

export default App
