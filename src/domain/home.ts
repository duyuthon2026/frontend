export type HomeMetric = {
  label: string
  value: string
  tone: 'green' | 'gold' | 'red'
}

export type QuickAction = {
  description: string
  label: string
  target: 'capture' | 'review' | 'inventory' | 'recipes'
}

export type AppNavigationItem = {
  label: string
  target: 'today' | QuickAction['target']
}

export type FlowStep = AppNavigationItem & {
  description: string
  index: string
}

export type ReviewQueueItem = {
  amount: string
  id: string
  meal: string
  status: '대기' | '분석중' | '완료'
  time: string
}

export type InventoryItem = {
  daysLeft: number
  id: string
  name: string
  storage: '냉장' | '냉동' | '실온'
}

export type RecipeSuggestion = {
  id: string
  ingredients: string
  name: string
  time: string
}

export const homeMetrics: HomeMetric[] = [
  { label: '이번 주 절감', value: '1.8kg', tone: 'green' },
  { label: '임박 식재료', value: '4개', tone: 'gold' },
  { label: '리뷰 대기', value: '2건', tone: 'red' },
]

export const appNavigationItems: AppNavigationItem[] = [
  { label: '오늘', target: 'today' },
  { label: '촬영', target: 'capture' },
  { label: '보관함', target: 'inventory' },
  { label: '레시피', target: 'recipes' },
]

export const flowSteps: FlowStep[] = [
  {
    index: '01',
    label: '오늘',
    description: '절감량과 임박 식재료 확인',
    target: 'today',
  },
  {
    index: '02',
    label: '촬영',
    description: '식사 전후 사진 기록',
    target: 'capture',
  },
  {
    index: '03',
    label: '리뷰',
    description: '잔반량과 원인 태그 정리',
    target: 'review',
  },
  {
    index: '04',
    label: '보관함',
    description: '소진 우선순위 확인',
    target: 'inventory',
  },
  {
    index: '05',
    label: '레시피',
    description: '남은 식재료로 메뉴 선택',
    target: 'recipes',
  },
]

export const quickActions: QuickAction[] = [
  {
    label: '식판 촬영',
    description: '식사 전후 이미지를 남기고 잔반량을 비교',
    target: 'capture',
  },
  {
    label: '잔반 리뷰',
    description: '분석 결과 확인, 원인 태그, 메모 입력',
    target: 'review',
  },
  {
    label: '보관함',
    description: '유통기한 임박 식재료와 소진 우선순위 확인',
    target: 'inventory',
  },
  {
    label: '레시피 추천',
    description: '남은 식재료 기반으로 오늘 만들 메뉴 탐색',
    target: 'recipes',
  },
]

export const reviewQueue: ReviewQueueItem[] = [
  {
    id: 'review-1',
    meal: '점심 급식',
    amount: '잔반 18%',
    status: '분석중',
    time: '12:45',
  },
  {
    id: 'review-2',
    meal: '어제 저녁',
    amount: '잔반 9%',
    status: '대기',
    time: '어제',
  },
]

export const inventoryItems: InventoryItem[] = [
  { id: 'inv-1', name: '애호박', storage: '냉장', daysLeft: 1 },
  { id: 'inv-2', name: '두부', storage: '냉장', daysLeft: 2 },
  { id: 'inv-3', name: '버섯', storage: '냉동', daysLeft: 5 },
]

export const recipeSuggestions: RecipeSuggestion[] = [
  {
    id: 'recipe-1',
    name: '애호박 두부 덮밥',
    ingredients: '애호박, 두부, 버섯',
    time: '15분',
  },
  {
    id: 'recipe-2',
    name: '버섯 된장국',
    ingredients: '버섯, 두부',
    time: '12분',
  },
]
