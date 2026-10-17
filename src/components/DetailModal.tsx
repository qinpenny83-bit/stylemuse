/* 通用详情弹层 */
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function DetailModal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-2xl',
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-md" onClick={onClose} />
      <div
        className={`relative max-h-[92vh] w-full ${maxWidth} animate-fade-up overflow-y-auto rounded-t-2xl border border-cream-200/80 bg-cream-50 shadow-lift sm:rounded-2xl`}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-soft transition-colors hover:text-ink-950"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
