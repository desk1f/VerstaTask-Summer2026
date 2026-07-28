import { Link } from 'react-router-dom'
import { StatusPanel } from '../components/StatusPanel'

export function NotFoundPage() {
  return (
    <StatusPanel title="Страница не найдена" action={<Link className="button button-secondary" to="/">Вернуться на главную</Link>}>
      <p>Проверьте адрес или перейдите в нужный раздел через навигацию.</p>
    </StatusPanel>
  )
}
