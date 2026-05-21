import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
  fallbackTitle?: string
}

type ErrorBoundaryState = {
  errorMessage: string | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    errorMessage: null,
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      errorMessage: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Screen rendering failed:', error, info.componentStack)
    }
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <section className="grid gap-3 rounded-2xl border border-[var(--color-error)]/30 bg-[var(--color-surface-danger-soft)]/30 p-5 text-[var(--color-content-default)] shadow-[var(--shadow-glass)]">
          <p className="m-0 text-[0.72rem] font-black uppercase tracking-wider text-[var(--color-error)]">
            화면 오류
          </p>
          <h2 className="m-0 text-[1.05rem] font-extrabold">
            {this.props.fallbackTitle ?? '화면을 불러오지 못했습니다'}
          </h2>
          <p className="m-0 text-[0.82rem] leading-relaxed text-[var(--color-content-muted)]">
            잠시 후 다시 시도해주세요. 개발 모드에서는 콘솔에서 상세 오류를 확인할 수 있습니다.
          </p>
        </section>
      )
    }

    return this.props.children
  }
}
