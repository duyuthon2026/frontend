import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Icon } from '../../components/ui/Icons'
import { QuantityInput } from '../../components/ui/QuantityInput'
import { usePrototypeStore } from '../../stores/usePrototypeStore'
import { useCamera } from '../../hooks/useCamera'
import { calculateDaysLeft } from '../../domain/prototype'
import { cn } from '../../lib/cn'
import {
  formatQuantityLabel,
  getDefaultQuantityUnit,
  parseQuantityFromText,
  parseQuantityLabel,
} from '../../lib/quantity'

type FormSubmitEvent = { preventDefault: () => void }
type LensCandidate = ReturnType<typeof usePrototypeStore.getState>['lensCandidates'][number]

const scanGridCells = Array.from({ length: 9 }, (_, index) => index)

const cameraGuideItems = ['영수증 글자는 중앙에', '재료는 겹치지 않게', '어두우면 파일 업로드']

const candidateListVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.055,
    },
  },
}

const candidateCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 14 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 26, stiffness: 260 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    x: -64,
    transition: { duration: 0.18 },
  },
}

const foldVariants: Variants = {
  closed: {
    clipPath: 'inset(0% 0% 100% 0% round 14px)',
    height: 0,
    opacity: 0,
  },
  open: {
    clipPath: 'inset(0% 0% 0% 0% round 14px)',
    height: 'auto',
    opacity: 1,
  },
}

export function LensTab() {
  const setActiveTab = usePrototypeStore((state) => state.setActiveTab)
  const addItemsBatch = usePrototypeStore((state) => state.addItemsBatch)

  const step = usePrototypeStore((state) => state.activeLensStep)
  const setStep = usePrototypeStore((state) => state.setActiveLensStep)
  const candidates = usePrototypeStore((state) => state.lensCandidates)
  const setCandidates = usePrototypeStore((state) => state.setLensCandidates)
  const removeCandidate = usePrototypeStore((state) => state.removeLensCandidate)
  const updateCandidate = usePrototypeStore((state) => state.updateLensCandidate)
  const clearCandidates = usePrototypeStore((state) => state.clearLensCandidates)

  const [progress, setProgress] = useState(0)
  const [naturalText, setNaturalText] = useState('')
  const [isNaturalMode, setIsNaturalMode] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [expandedCandidateIds, setExpandedCandidateIds] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { startCamera, stopCamera, videoRef, isActive: isCameraActive } = useCamera()

  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editQuantityAmount, setEditQuantityAmount] = useState('')
  const [editQuantityUnit, setEditQuantityUnit] = useState('개')
  const [editLocation, setEditLocation] = useState('냉장')
  const [editExpiresAt, setEditExpiresAt] = useState('')

  const confidenceScore = candidates.length > 0
    ? Math.min(98, Math.max(80, 85 + (candidates.reduce((acc, c) => acc + c.name.length, 0) % 14)))
    : 0

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (step === 'analyzing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            timer = setTimeout(() => {
              setStep('result')
            }, 400)
            return 100
          }
          return prev + 5
        })
      }, 80)
      return () => {
        clearInterval(interval)
        clearTimeout(timer)
      }
    }
  }, [step, setStep])

  useEffect(() => {
    if (step === 'complete') {
      const redirectTimer = setTimeout(() => {
        setActiveTab('inventory')
        setStep('camera')
        setIsNaturalMode(false)
        setNaturalText('')
        if (uploadedImageUrl) {
          URL.revokeObjectURL(uploadedImageUrl)
          setUploadedImageUrl(null)
        }
      }, 1500)
      return () => clearTimeout(redirectTimer)
    }
  }, [step, setActiveTab, setStep, uploadedImageUrl])

  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl)
      }
    }
  }, [uploadedImageUrl])

  const handleShutterClick = () => {
    stopCamera()
    setProgress(0)
    setStep('analyzing')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl)
      }
      const url = URL.createObjectURL(file)
      setUploadedImageUrl(url)
      stopCamera()
      setProgress(0)
      setStep('analyzing')
    }
  }

  const handleNaturalSubmit = (e: FormSubmitEvent) => {
    e.preventDefault()
    if (!naturalText.trim()) return

    const text = naturalText.trim()
    let parsedName = text
    let parsedQty = parseQuantityFromText(text, getDefaultQuantityUnit(text, '개'))
    let parsedDays = 3

    if (text.includes('두부')) {
      parsedName = '두부'
      parsedQty = parseQuantityFromText(text, '모')
      parsedDays = 3
    } else if (text.includes('애호박')) {
      parsedName = '애호박'
      parsedQty = parseQuantityFromText(text, '개')
      parsedDays = 2
    }

    const d = new Date()
    const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + parsedDays)
    const yyyy = localDate.getFullYear()
    const mm = String(localDate.getMonth() + 1).padStart(2, '0')
    const dd = String(localDate.getDate()).padStart(2, '0')
    const expiresAt = `${yyyy}-${mm}-${dd}`

    const candidateId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    setCandidates([
      {
        id: candidateId,
        name: parsedName,
        quantity: formatQuantityLabel(parsedQty.amount, parsedQty.unit),
        location: '냉장',
        expiresAt,
      },
      ...candidates,
    ])
    setExpandedCandidateIds((ids) => [candidateId, ...ids.filter((id) => id !== candidateId)])
    setProgress(0)
    setStep('analyzing')
  }

  const handleBatchConfirm = () => {
    addItemsBatch(candidates)
    clearCandidates()
    setStep('complete')
  }

  const handleStartEdit = (item: LensCandidate) => {
    const parsedQuantity = parseQuantityLabel(item.quantity, getDefaultQuantityUnit(item.name, '개'))
    setEditingCandidateId(item.id)
    setEditName(item.name)
    setEditQuantityAmount(parsedQuantity.amount)
    setEditQuantityUnit(parsedQuantity.unit)
    setEditLocation(item.location)
    setEditExpiresAt(item.expiresAt)
    setExpandedCandidateIds((ids) => [item.id, ...ids.filter((id) => id !== item.id)])
  }

  const handleSaveEdit = () => {
    if (!editingCandidateId) return
    const currentCandidate = candidates.find((candidate) => candidate.id === editingCandidateId)
    if (!currentCandidate) return

    updateCandidate(editingCandidateId, {
      name: editName,
      quantity: formatQuantityLabel(editQuantityAmount, editQuantityUnit),
      location: editLocation,
      expiresAt: editExpiresAt || currentCandidate.expiresAt,
    })
    setEditingCandidateId(null)
  }

  const handleToggleCandidate = (id: string) => {
    setExpandedCandidateIds((ids) =>
      ids.includes(id) ? ids.filter((candidateId) => candidateId !== id) : [id, ...ids],
    )
  }

  const handleRemoveCandidate = (id: string) => {
    removeCandidate(id)
    setExpandedCandidateIds((ids) => ids.filter((candidateId) => candidateId !== id))
    if (editingCandidateId === id) {
      setEditingCandidateId(null)
    }
  }

  const previewImageUrl = uploadedImageUrl ? getTrustedBlobUrl(uploadedImageUrl) : null

  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden grid gap-1 pt-3 pb-1">
        <p className="m-0 text-[0.68rem] font-black uppercase tracking-widest text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
          AI 렌즈
        </p>
        <h1 className="m-0 text-[1.8rem] leading-none font-extrabold tracking-tight text-[var(--color-content-default)]">
          {step === 'camera' && '영수증 또는 냉장고 스캔'}
          {step === 'analyzing' && '식재료 자동 인식 중'}
          {step === 'result' && '인식 결과 확인 및 승인'}
          {step === 'complete' && '보관함 등록 완료'}
        </h1>
        <p className="m-0 text-[0.82rem] text-[var(--color-content-muted)] max-w-sm">
          {step === 'camera' && '영수증을 촬영하거나 냉장고 내부를 찍어 자동으로 재료를 등록하세요.'}
          {step === 'analyzing' && '이미지에서 텍스트(OCR)를 추출하고 푸드 사전을 통해 소비기한을 예측합니다.'}
          {step === 'result' && '감지된 식재료의 이름, 보관 위치, 예상 기한을 터치하여 바로 보완하세요.'}
          {step === 'complete' && '성공적으로 보관함에 식재료가 등록되었습니다. 곧 화면이 전환됩니다.'}
        </p>
      </section>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {step === 'camera' && (
          <motion.div
            key="camera-step"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4.5"
          >
            {!isNaturalMode ? (
              <div
                className="relative overflow-hidden aspect-[4/3] rounded-2xl bg-[var(--color-camera-bg)] border border-[var(--color-camera-border)] shadow-[var(--shadow-premium)] flex flex-col items-center justify-center text-[var(--color-camera-content)]"
                aria-label="카메라 미리보기"
              >
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="Uploaded preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}

                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                  {scanGridCells.map((i) => (
                    <div key={i} className="border border-[var(--color-camera-content)]/40" />
                  ))}
                </div>

                <div className="absolute h-36 w-36 rounded-2xl border border-dashed border-[var(--color-primary)]/60 flex items-center justify-center pointer-events-none">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                </div>

                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent scanner-laser pointer-events-none" />

                <div className="flex flex-col items-center gap-1.5 z-10 px-6 text-center bg-[var(--color-camera-bg)]/40 p-4 rounded-xl backdrop-blur-sm max-w-[85%]">
                  <Icon.Camera size={40} className="text-[var(--color-primary)] opacity-90 animate-pulse" />
                  <span className="text-[0.82rem] font-extrabold text-[var(--color-camera-muted)] mt-1">
                    {isCameraActive ? '실시간 카메라 작동 중' : '카메라 촬영 시뮬레이터'}
                  </span>
                  <span className="text-[0.7rem] font-medium text-[var(--color-camera-subtle)] leading-relaxed">
                    {isCameraActive
                      ? '화면 중앙에 영수증이나 식재료를 맞추고 촬영 버튼을 누르세요.'
                      : '실제 카메라를 켜거나, 사진 파일을 업로드하여 식재료를 스캔할 수 있습니다.'}
                  </span>
                </div>

                {isCameraActive ? (
                  <button
                    type="button"
                    onClick={handleShutterClick}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-camera-control-bg)] text-[var(--color-camera-control-content)] border-4 border-[var(--color-camera-border)]/40 shadow-lg active:scale-90 transition-transform cursor-pointer"
                    aria-label="촬영 버튼"
                  />
                ) : (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-xs border-0 cursor-pointer shadow-md"
                    >
                      카메라 켜기
                    </button>
                    <button
                      type="button"
                      onClick={handleShutterClick}
                      className="px-4 py-2 rounded-xl bg-[var(--color-camera-control-bg)] text-[var(--color-camera-control-content)] font-bold text-xs border-0 cursor-pointer shadow-md"
                    >
                      시뮬레이터 촬영
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleNaturalSubmit} className="grid gap-3.5 bg-[var(--color-bg-overlay)] border border-[var(--color-border-default)] p-5 rounded-2xl shadow-[var(--shadow-glass)]">
                <label className="grid gap-1.5 text-[0.76rem] font-extrabold text-[var(--color-content-muted)]">
                  한 줄 식재료 자연어 입력
                  <textarea
                    rows={3}
                    placeholder="예: 두부 한 모 냉장 3일, 삼겹살 300g 냉동 14일"
                    value={naturalText}
                    onChange={(e) => setNaturalText(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-default)] p-3 font-normal focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none placeholder-[var(--color-content-subtle)]"
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="min-h-11 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-extrabold text-[0.84rem] shadow-[var(--shadow-glass)] transition-all cursor-pointer border-0"
                >
                  <Icon.Sparkles size={14} />
                  분석 및 등록
                </button>
              </form>
            )}

            {!isNaturalMode && (
              <div className="grid grid-cols-3 gap-2">
                {cameraGuideItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] px-2.5 py-2 text-center text-[0.68rem] font-black text-[var(--color-content-muted)] shadow-[var(--shadow-glass)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setIsNaturalMode(!isNaturalMode)}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] text-[var(--color-content-default)] text-[0.78rem] font-bold hover:border-[var(--color-border-brand)] transition-all cursor-pointer"
              >
                {isNaturalMode ? (
                  <>
                    <Icon.Camera size={14} />
                    카메라 촬영 스캔
                  </>
                ) : (
                  <>
                    <Icon.Sparkles size={14} />
                    자연어 타이핑 입력
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] text-[var(--color-content-default)] text-[0.78rem] font-bold hover:border-[var(--color-border-brand)] transition-all cursor-pointer"
              >
                <Icon.Inventory size={14} />
                사진 파일 업로드
              </button>
            </div>
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div
            key="analyzing-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4.5 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] p-6 shadow-[var(--shadow-glass)] text-center justify-items-center"
          >
            <div className="relative flex items-center justify-center h-16 w-16 my-2">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--color-border-default)] opacity-60" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[var(--color-primary)] animate-spin" />
              <Icon.Sparkles size={24} className="text-[var(--color-secondary)] animate-pulse" />
            </div>

            <div className="grid gap-1">
              <strong className="text-[1.05rem] font-extrabold text-[var(--color-content-default)]">
                영상이미지 속 식재료 스캔 중
              </strong>
              <p className="m-0 text-[0.78rem] text-[var(--color-content-muted)]">
                OCR 이미지 해독 기술과 식생활 패턴 사전을 조합하고 있습니다.
              </p>
            </div>

            <div className="w-full h-2 overflow-hidden rounded-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] mt-2">
              <div
                className="h-full bg-[var(--color-primary)] transition-all duration-100 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[0.72rem] font-black text-[var(--color-secondary)] dark:text-[var(--color-tertiary)] mt-0.5">
              분석 완료율 {progress}%
            </span>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-3.5"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-[0.76rem] font-bold text-[var(--color-content-muted)]">
                AI가 감지한 식재료 목록
              </span>
              <span className="text-[0.66rem] font-black text-[var(--color-secondary)] dark:text-[var(--color-tertiary)] uppercase px-1.5 py-0.5 rounded bg-[var(--color-surface-brand-soft)] border border-[var(--color-border-brand)]">
                신뢰도 {confidenceScore}%
              </span>
            </div>

            <motion.div
              variants={candidateListVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-2"
            >
              <AnimatePresence initial={false}>
              {candidates.map((item) => {
                const isEditing = editingCandidateId === item.id
                const isExpanded = expandedCandidateIds.includes(item.id) || isEditing
                const daysLeft = calculateDaysLeft(item.expiresAt)

                return (
                  <motion.article
                    key={item.id}
                    variants={candidateCardVariants}
                    layout="position"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: -96, right: 0 }}
                    dragElastic={{ left: 0.14, right: 0 }}
                    onDragEnd={(_event, info) => {
                      if (info.offset.x < -76 || info.velocity.x < -500) {
                        handleRemoveCandidate(item.id)
                      }
                    }}
                    className="relative grid gap-3 overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] p-3.5 shadow-[var(--shadow-glass)]"
                  >
                    <div className="pointer-events-none absolute inset-y-0 right-0 grid w-16 place-items-center bg-[var(--color-surface-danger-soft)] text-[var(--color-error)] opacity-70">
                      <Icon.Trash size={16} />
                    </div>
                    <div className="relative z-10 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => handleToggleCandidate(item.id)}
                        className="grid min-w-0 flex-1 gap-1 border-0 bg-transparent p-0 text-left cursor-pointer"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-2">
                          <strong className="truncate text-[0.92rem] font-extrabold text-[var(--color-content-default)]">
                            {item.name}
                          </strong>
                          <span className="shrink-0 rounded-md border border-[var(--color-border-brand)] bg-[var(--color-surface-brand-soft)] px-1.5 py-0.5 text-[0.64rem] font-black text-[var(--color-content-brand)]">
                            {item.quantity}
                          </span>
                        </div>
                        <span className="text-[0.72rem] font-bold text-[var(--color-content-muted)]">
                          {item.location} 보관 · {daysLeft < 0 ? '기한초과' : daysLeft === 0 ? '오늘까지' : `D-${daysLeft}`} · {item.expiresAt}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="h-8 px-3 flex items-center justify-center rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[0.72rem] font-bold text-[var(--color-content-default)] hover:border-[var(--color-border-brand)] transition-colors cursor-pointer"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCandidate(item.id)}
                          className="h-8 px-3 flex items-center justify-center rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[0.72rem] font-bold text-[var(--color-content-default)] hover:border-red-300 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          제외
                        </button>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key={isEditing ? 'edit' : 'preview'}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          variants={foldVariants}
                          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                          className="relative z-10 overflow-hidden"
                        >
                    {isEditing ? (
                      <div className="grid gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)]/70 p-3">
                        <div className="grid gap-1">
                          <span className="text-[0.7rem] font-bold text-[var(--color-content-muted)]">이름</span>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="min-h-9 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 text-[0.82rem] text-[var(--color-content-default)] focus:outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <div className="grid grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] gap-2">
                          <QuantityInput
                            amount={editQuantityAmount}
                            label="수량"
                            onAmountChange={setEditQuantityAmount}
                            unit={editQuantityUnit}
                          />
                          <div className="grid gap-1">
                            <span className="text-[0.7rem] font-bold text-[var(--color-content-muted)]">소비기한</span>
                            <input
                              type="date"
                              value={editExpiresAt}
                              onChange={(e) => setEditExpiresAt(e.target.value)}
                              className="min-h-9 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 text-[0.82rem] text-[var(--color-content-default)] focus:outline-none focus:border-[var(--color-primary)]"
                              required
                            />
                          </div>
                        </div>
                        <p className="m-0 text-[0.68rem] font-semibold text-[var(--color-content-muted)]">
                          단위는 자동 인식값으로 고정됩니다. 숫자만 보정하세요.
                        </p>
                        <div className="grid gap-1">
                          <span className="text-[0.7rem] font-bold text-[var(--color-content-muted)]">보관 위치</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {['냉장', '냉동', '실온'].map((loc) => (
                              <button
                                type="button"
                                key={loc}
                                onClick={() => setEditLocation(loc)}
                                className={cn(
                                  'min-h-8 rounded-lg border text-[0.76rem] font-bold transition-all',
                                  editLocation === loc
                                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-on-primary)]'
                                    : 'bg-[var(--color-bg-base)] border-[var(--color-border-default)] text-[var(--color-content-muted)]'
                                )}
                              >
                                {loc}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setEditingCandidateId(null)}
                            className="px-3 py-1.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[0.74rem] font-bold text-[var(--color-content-default)]"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[0.74rem] font-bold border-0"
                          >
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)]/70 p-3 text-center">
                        <div className="grid gap-0.5">
                          <span className="text-[0.62rem] font-black text-[var(--color-content-muted)]">위치</span>
                          <strong className="text-[0.76rem] text-[var(--color-content-default)]">{item.location}</strong>
                        </div>
                        <div className="grid gap-0.5">
                          <span className="text-[0.62rem] font-black text-[var(--color-content-muted)]">수량</span>
                          <strong className="text-[0.76rem] text-[var(--color-content-default)]">{item.quantity}</strong>
                        </div>
                        <div className="grid gap-0.5">
                          <span className="text-[0.62rem] font-black text-[var(--color-content-muted)]">상태</span>
                          <strong className="text-[0.76rem] text-[var(--color-content-default)]">
                            {daysLeft < 0 ? '확인 필요' : daysLeft <= 2 ? '빠른 소진' : '여유'}
                          </strong>
                        </div>
                      </div>
                    )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                )
              })}
              </AnimatePresence>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => setStep('camera')}
                className="min-h-11 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[0.84rem] font-bold text-[var(--color-content-default)] hover:border-[var(--color-border-brand)] transition-colors cursor-pointer"
              >
                재촬영
              </button>
              <button
                type="button"
                onClick={handleBatchConfirm}
                disabled={candidates.length === 0}
                className="min-h-11 rounded-xl border-0 bg-[var(--color-primary)] text-[0.84rem] font-extrabold text-[var(--color-on-primary)] shadow-[var(--shadow-glass)] transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                식재료 일괄 등록
              </button>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid gap-3.5 rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-bg-overlay)] p-6 shadow-[var(--shadow-glass)] text-center justify-items-center"
          >
            <div className="h-11 w-11 rounded-full bg-[var(--color-success)] text-[var(--color-on-secondary)] flex items-center justify-center shadow-md animate-bounce">
              <Icon.Check size={20} />
            </div>

            <div className="grid gap-1">
              <strong className="text-[1.12rem] font-extrabold text-[var(--color-content-default)]">
                보관 식재료 추가 완료!
              </strong>
              <p className="m-0 text-[0.8rem] text-[var(--color-content-muted)]">
                추출된 식재료들이 인벤토리에 안전하게 정렬되었습니다.
              </p>
            </div>

            <span className="text-[0.7rem] font-bold text-[var(--color-success)] mt-1 animate-pulse">
              곧 보관함 화면으로 이동합니다...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const getTrustedBlobUrl = (value: string) => {
  try {
    const parsed = new URL(value)

    if (parsed.protocol !== 'blob:') return null
    if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) return null

    return parsed.toString()
  } catch {
    return null
  }
}
