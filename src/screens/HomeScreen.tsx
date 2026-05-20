import { motion } from 'framer-motion'
import { Panel } from '../components/ui/Panel'
import { brand } from '../config/brand'
import {
  flowSteps,
  homeMetrics,
  inventoryItems,
  quickActions,
  recipeSuggestions,
  reviewQueue,
} from '../domain/home'
import { CameraCaptureCard } from '../features/capture/CameraCaptureCard'
import { NotificationSetupCard } from '../features/notifications/NotificationSetupCard'

export function HomeScreen() {
  return (
    <main className="app-main">
      <motion.section
        id="today"
        className="hero-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="eyebrow">오늘의 잔반 관리</p>
        <h1>먹기 전부터 남은 뒤까지 한 번에 기록</h1>
        <p>{brand.description}</p>
      </motion.section>

      <section className="metric-grid" aria-label="오늘 요약">
        {homeMetrics.map((metric) => (
          <article className={`metric-card metric-${metric.tone}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="flow-strip" aria-label="모바일 앱 플로우">
        {flowSteps.map((step) => (
          <a
            className={`flow-step ${step.target === 'today' ? 'is-active' : ''}`}
            href={`#${step.target}`}
            key={step.target}
          >
            <span>{step.index}</span>
            <strong>{step.label}</strong>
            <small>{step.description}</small>
          </a>
        ))}
      </section>

      <section className="quick-grid" aria-label="빠른 실행">
        {quickActions.map((action) => (
          <a className="quick-action" href={`#${action.target}`} key={action.target}>
            <span>{action.label}</span>
            <small>{action.description}</small>
          </a>
        ))}
      </section>

      <section className="content-grid">
        <CameraCaptureCard />
        <NotificationSetupCard />
        <ReviewQueue />
        <InventoryPreview />
        <RecipePreview />
      </section>
    </main>
  )
}

function ReviewQueue() {
  return (
    <Panel id="review" eyebrow="Review queue" title="잔반 리뷰">
      <div className="list-stack">
        {reviewQueue.map((item) => (
          <article className="list-row" key={item.id}>
            <div>
              <strong>{item.meal}</strong>
              <span>{item.time}</span>
            </div>
            <div>
              <span>{item.amount}</span>
              <em>{item.status}</em>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  )
}

function InventoryPreview() {
  return (
    <Panel id="inventory" eyebrow="Inventory" title="소진 우선 식재료">
      <div className="list-stack">
        {inventoryItems.map((item) => (
          <article className="list-row" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.storage}</span>
            </div>
            <div>
              <span>D-{item.daysLeft}</span>
              <em>추천 필요</em>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  )
}

function RecipePreview() {
  return (
    <Panel id="recipes" eyebrow="Recipes" title="남기기 전 소진 메뉴">
      <div className="list-stack">
        {recipeSuggestions.map((recipe) => (
          <article className="list-row" key={recipe.id}>
            <div>
              <strong>{recipe.name}</strong>
              <span>{recipe.ingredients}</span>
            </div>
            <div>
              <span>{recipe.time}</span>
              <em>추천</em>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  )
}
