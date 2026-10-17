/* 智能图片：加载中显示骨架，失败降级为配色占位（离线可用） */
import { useState } from 'react'
import type { ImageRef } from '../types'
import { imageUrl } from '../data/images'

interface Props {
  image: ImageRef
  alt?: string
  className?: string
  imgClassName?: string
  size?: 'landscape_4_3' | 'portrait_4_3' | 'square'
  /** 占位区固定宽高比 */
  ratio?: string
  eager?: boolean
  /** 卡片模式：hover 缩放 + 底部渐晕 */
  card?: boolean
}

export default function SmartImage({
  image,
  alt,
  className = '',
  imgClassName = '',
  size = 'landscape_4_3',
  ratio = 'aspect-[4/3]',
  eager = false,
  card = false,
}: Props) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  return (
    <div className={`relative overflow-hidden ${ratio} ${className}`}>
      {status !== 'error' ? (
        <img
          src={imageUrl(image, size)}
          alt={alt ?? image.alt}
          loading={eager ? 'eager' : 'lazy'}
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('error')}
          className={`h-full w-full object-cover transition-[opacity,transform] duration-500 ${
            status === 'ok' ? 'opacity-100' : 'opacity-0'
          } ${card ? 'group-hover:scale-[1.05]' : ''} ${imgClassName}`}
        />
      ) : null}
      {card && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
          style={{ background: 'linear-gradient(to top, rgb(28 24 21 / 0.32), transparent)' }}
          aria-hidden
        />
      )}
      {/* 加载失败占位：以风格配色渐变 + 标题呈现，保证离线可用 */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-500 ${
          status === 'error' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(135deg, ${image.fallbackColor} 0%, ${image.fallbackColor2 ?? image.fallbackColor} 100%)`,
        }}
        aria-hidden={status !== 'error'}
      >
        <span className="text-[12px] font-medium tracking-[0.2em] text-ink-700/70 uppercase">
          StyleMuse
        </span>
        <span className="max-w-[80%] text-center text-[12px] text-ink-700/60">{image.alt}</span>
      </div>
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-cream-200/70" aria-hidden />
      )}
    </div>
  )
}
