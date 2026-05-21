import { getRelativeDateString, parseLocalDate } from '../lib/date'

export type AppTabId = 'home' | 'inventory' | 'lens' | 'recipes' | 'my'
export type HomeStateId = 'default' | 'empty' | 'expiring' | 'overdue'
export type LensStepId =
  | 'camera'
  | 'analyzing'
  | 'result'
  | 'approval'
  | 'edit'
  | 'manual'
  | 'complete'
export type InventoryViewId = 'list' | 'filter' | 'detail' | 'add' | 'edit' | 'delete'
export type RecipeViewId = 'main' | 'search' | 'conditions' | 'detail' | 'saved' | 'complete'
export const storageLocations = ['냉장', '냉동', '실온'] as const
export type StorageLocation = (typeof storageLocations)[number]

export type AppTab = {
  id: AppTabId
  label: string
  description: string
}

export type PrototypeScreen = {
  description: string
  id: string
  label: string
  meta?: string
  title: string
}

export type HomeState = {
  id: HomeStateId
  label: string
  title: string
  description: string
  tone: 'ready' | 'empty' | 'warning' | 'danger'
}

export type InventoryItem = {
  id: string
  name: string
  quantity: string
  location: StorageLocation
  expiresAt: string // YYYY-MM-DD
}

export type RecipeIngredient = {
  name: string
  quantity: string
  avatar: string
}

export type RecipeCard = {
  id: string
  ingredients: RecipeIngredient[]
  name: string
  saved: boolean
  time: string
}

export const isStorageLocation = (location: unknown): location is StorageLocation =>
  typeof location === 'string' && storageLocations.some((candidate) => candidate === location)

export const calculateDaysLeft = (expiresAt: string): number => {
  const today = new Date()
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const targetLocal = parseLocalDate(expiresAt)
  if (!targetLocal) return 0

  const diffTime = targetLocal.getTime() - todayLocal.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

export const calculateStatus = (daysLeft: number): 'safe' | 'soon' | 'overdue' => {
  if (daysLeft < 0) return 'overdue'
  if (daysLeft <= 2) return 'soon'
  return 'safe'
}

export const appTabs: AppTab[] = [
  { id: 'home', label: '오늘', description: '오늘 요약과 상태' },
  { id: 'inventory', label: '보관함', description: '보관 식재료' },
  { id: 'lens', label: '촬영', description: '촬영 분석' },
  { id: 'recipes', label: '레시피', description: '추천과 저장' },
]

export const onboardingScreens: PrototypeScreen[] = [
  {
    id: 'splash',
    label: '스플래시',
    title: '잔반제로',
    description: '로고와 오늘의 절감 목표를 짧게 보여주는 첫 진입 화면',
    meta: '0.8초',
  },
  {
    id: 'intro',
    label: '서비스 소개',
    title: '찍고, 확인하고, 소진하기',
    description: '냉장고/영수증 사진을 식재료 목록과 레시피 추천으로 연결',
    meta: '3 cards',
  },
  {
    id: 'permission',
    label: '권한 요청',
    title: '카메라와 알림 허용',
    description: '렌즈 촬영, 소비기한 알림, 리뷰 대기 알림을 한 화면에서 요청',
    meta: 'Camera + Push',
  },
  {
    id: 'preference',
    label: '초기 설정',
    title: '보관 위치와 제외 재료',
    description: '냉장/냉동/실온 기본 위치와 못 먹는 재료를 간단히 설정',
    meta: 'Skip 가능',
  },
]

export const homeStates: HomeState[] = [
  {
    id: 'default',
    label: '기본',
    title: '오늘 소비하면 좋은 재료 4개',
    description: '냉장실 중심으로 소진 우선순위를 보여줌',
    tone: 'ready',
  },
  {
    id: 'empty',
    label: '비어 있음',
    title: '아직 등록된 식재료가 없음',
    description: '렌즈로 냉장고나 영수증을 촬영하게 유도',
    tone: 'empty',
  },
  {
    id: 'expiring',
    label: '임박',
    title: '소비기한 임박 3개',
    description: '오늘 안에 쓸 재료와 추천 레시피를 우선 노출',
    tone: 'warning',
  },
  {
    id: 'overdue',
    label: '확인 필요',
    title: '기한 초과/확인 필요 1개',
    description: '폐기, 연장, 상태 확인 액션을 바로 제공',
    tone: 'danger',
  },
]

export const lensSteps: PrototypeScreen[] = [
  {
    id: 'camera',
    label: '카메라',
    title: '냉장고 또는 영수증 촬영',
    description: '카메라 프레임, 갤러리 선택, 자연어 추가 진입',
  },
  {
    id: 'analyzing',
    label: '분석 중',
    title: '식재료를 읽는 중',
    description: '이미지 업로드, OCR, 식재료 후보 추출 진행 상태',
  },
  {
    id: 'result',
    label: '분석 결과',
    title: '식재료 후보 6개 감지',
    description: '이름, 수량, 보관 위치, 소비기한 후보를 카드로 검토',
  },
  {
    id: 'approval',
    label: '승인 대기',
    title: '등록 전 확인 리스트',
    description: '신뢰도 낮은 항목은 수정 필요 상태로 분리',
  },
  {
    id: 'edit',
    label: '재료 수정',
    title: '두부 정보 수정',
    description: '수량, 위치, 소비기한을 바텀시트 형태로 편집',
  },
  {
    id: 'manual',
    label: '수동 추가',
    title: '자연어로 빠르게 추가',
    description: '"두부 한 모 냉장 3일" 같은 문장 입력',
  },
  {
    id: 'complete',
    label: '등록 완료',
    title: '6개 재료 등록 완료',
    description: '인벤토리 이동과 바로 레시피 추천 CTA 제공',
  },
]

export const inventoryViews: PrototypeScreen[] = [
  {
    id: 'list',
    label: '리스트',
    title: '인벤토리 리스트',
    description: '보관 위치와 소비기한 기준으로 식재료를 훑어봄',
  },
  {
    id: 'filter',
    label: '검색/필터',
    title: '검색, 필터, 정렬 상태',
    description: '위치, 임박 여부, 이름, 최근 등록순으로 좁힘',
  },
  {
    id: 'detail',
    label: '상세',
    title: '식재료 상세',
    description: '입고일, 소비기한, 연결 레시피, 기록을 확인',
  },
  {
    id: 'add',
    label: '수동 추가',
    title: '식재료 직접 추가',
    description: '이름, 수량, 위치, 소비기한을 직접 입력',
  },
  {
    id: 'edit',
    label: '수정',
    title: '식재료 수정',
    description: '수량 변경, 보관 위치 이동, 소비기한 보정',
  },
  {
    id: 'delete',
    label: '삭제/폐기',
    title: '삭제 또는 폐기 확인',
    description: '폐기 사유를 남기고 추천 데이터에 반영',
  },
]

export const recipeViews: PrototypeScreen[] = [
  {
    id: 'main',
    label: '메인',
    title: '오늘의 소진 레시피',
    description: '임박 식재료를 먼저 쓰는 메뉴를 추천',
  },
  {
    id: 'search',
    label: '검색 결과',
    title: '두부 검색 결과',
    description: '보유 재료 매칭률과 조리 시간으로 비교',
  },
  {
    id: 'conditions',
    label: '조건 선택',
    title: '추천 조건 선택',
    description: '시간, 난이도, 제외 재료, 보유 양념을 조정',
  },
  {
    id: 'detail',
    label: '상세',
    title: '애호박 두부 덮밥',
    description: '필요 재료, 부족 재료, 단계별 조리법 표시',
  },
  {
    id: 'saved',
    label: '저장됨',
    title: '저장한 레시피',
    description: '반복해서 쓰는 소진 메뉴 목록',
  },
  {
    id: 'complete',
    label: '요리 완료',
    title: '사용한 재료 차감',
    description: '요리 완료 뒤 인벤토리 수량을 확인하고 차감',
  },
]

export const inventoryItems: InventoryItem[] = [
  { id: 'i1', name: '두부', quantity: '1모', location: '냉장', expiresAt: getRelativeDateString(2) },
  { id: 'i2', name: '애호박', quantity: '1/2개', location: '냉장', expiresAt: getRelativeDateString(1) },
  { id: 'i3', name: '버섯', quantity: '180g', location: '냉동', expiresAt: getRelativeDateString(5) },
  { id: 'i4', name: '상추', quantity: '8장', location: '냉장', expiresAt: getRelativeDateString(-1) },
]

export const recipeCards: RecipeCard[] = [
  {
    id: 'r1',
    name: '애호박 두부 덮밥',
    ingredients: [
      { name: '두부', quantity: '1모', avatar: '⬜' },
      { name: '애호박', quantity: '1/2개', avatar: '🥒' },
      { name: '버섯', quantity: '180g', avatar: '🍄' },
    ],
    saved: true,
    time: '15분',
  },
  {
    id: 'r2',
    name: '버섯 된장국',
    ingredients: [
      { name: '버섯', quantity: '100g', avatar: '🍄' },
      { name: '두부', quantity: '1/2모', avatar: '⬜' },
    ],
    saved: false,
    time: '12분',
  },
  {
    id: 'r3',
    name: '상추 겉절이',
    ingredients: [
      { name: '상추', quantity: '8장', avatar: '🥬' },
      { name: '고춧가루', quantity: '1큰술', avatar: '🌶️' },
    ],
    saved: false,
    time: '7분',
  },
]

export const calendarPreview = [
  { day: '월', count: 1, tone: 'safe' },
  { day: '화', count: 2, tone: 'soon' },
  { day: '수', count: 4, tone: 'soon' },
  { day: '목', count: 1, tone: 'danger' },
  { day: '금', count: 3, tone: 'safe' },
  { day: '토', count: 1, tone: 'safe' },
  { day: '일', count: 0, tone: 'safe' },
]

export const mySettingGroups = [
  {
    title: '프로필 설정',
    items: ['닉네임', '기본 보관 위치', '가구 인원'],
  },
  {
    title: '알림 설정',
    items: ['소비기한 임박', '요리 완료 차감', '리뷰 대기'],
  },
  {
    title: '식습관 설정',
    items: ['제외 재료', '선호 조리 시간', '못 먹는 음식'],
  },
]
