/* ============================================================
 * 图片与内容管理
 * - 所有示意图均通过 text_to_image 服务按提示词生成
 * - 图片与内容分离：数据文件只声明 ImageRef，页面统一渲染
 * - 来源 / 许可 / 用途限制全部记录在 ImageRef 中
 * - 加载失败时由 <SmartImage> 组件降级为配色占位
 * ============================================================ */

import type { ImageRef } from '../types'

const IMG_BASE = 'https://console.enterprise.trae.cn/api/ide/v1/text_to_image'

const LICENSE_AI = 'AI 生成示意图（本服务按提示词生成，非摄影版权作品）'
const RESTRICT_AI = '仅作网站内风格参考示意，不用于商用印刷或二次分发'

/** 构造 AI 生成示意图引用 */
export function aiImg(
  prompt: string,
  alt: string,
  fallbackColor: string,
  fallbackColor2?: string,
): ImageRef {
  return {
    prompt,
    alt,
    source: 'ai-generated',
    license: LICENSE_AI,
    restrictions: RESTRICT_AI,
    fallbackColor,
    fallbackColor2,
  }
}

/** 构建可直接用于 <img src> 的地址：本地固定图优先，否则走动态生成 */
export function imageUrl(ref: ImageRef, size: 'landscape_4_3' | 'portrait_4_3' | 'square' = 'landscape_4_3'): string {
  if (ref.src) return ref.src
  const p = `${IMG_BASE}?prompt=${encodeURIComponent(ref.prompt)}&image_size=${size}`
  return p
}
