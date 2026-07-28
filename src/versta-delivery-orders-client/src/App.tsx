import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { NewOrderPage } from './pages/NewOrderPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrderDetailsPage } from './pages/OrderDetailsPage'
import { OrdersPage } from './pages/OrdersPage'
import './App.css'

function App() {
  const location = useLocation()
  const isOrdersSection = /^\/orders\/(?!new(?:\/|$))/.test(location.pathname)

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-content">
          <NavLink className="brand" to="/">Versta Delivery</NavLink>
          <nav aria-label="Основная навигация">
            <ul className="navigation">
              <li><NavLink to="/" end>Главная</NavLink></li>
              <li><NavLink to="/orders/new">Новый заказ</NavLink></li>
              <li>
                <NavLink
                  to="/orders"
                  end
                  className={({ isActive }) => isActive || isOrdersSection ? 'active' : undefined}
                  aria-current={isOrdersSection ? 'page' : undefined}
                >
                  Заказы
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
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
