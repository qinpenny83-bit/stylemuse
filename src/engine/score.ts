/* ============================================================
 * 推荐规则引擎（纯函数，可单元测试，本地运行，不依赖外部 API）
 *
 * 设计原则：
 * - 透明：每条推荐都附「与用户已知信息关联的理由」
 * - 不编造：信息不足时输出 infoGaps，不做无依据断言
 * - 可调整：支持 7 种调整维度，调整后重新排序
 * ============================================================ */

import type { AdjustmentKey, ImageProfile, RecommendedStyle } from '../types'
import { STYLES, getStyle } from '../data/styles'

export interface ScoredStyle {
  styleId: string
  score: number
  reasons: string[]
}

/** 基于 id 与种子的确定性伪随机数（0~1），同一 (id, seed) 永远返回同一值 */
function rand(id: string, seed: number): number {
  let h = 2166136261
  const key = `${id}#${seed}`
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

/**
 * 种子抖动：给候选项附加确定性小扰动，让分数接近的方案随「换一批」轮换，
 * 同时高分项保持稳定（span 远小于特征得分 2.5-8 的差距）。seed 为 0 时不抖动。
 */
export function seedJitter(id: string, seed: number, span = 0.8): number {
  if (!seed) return 0
  return (rand(id, seed) * 2 - 1) * span
}

/** 调整维度对风格的影响权重 */
export const ADJUSTMENT_WEIGHTS: Record<AdjustmentKey, Record<string, number>> = {
  cute: {
    'japanese-sweet': 3, 'korean-sweet': 2, 'ballet-core': 3, 'preppy-girl': 2,
    'street-sweet': 1.5, 'y2k': 1, 'pure-desire': 1,
  },
  mature: {
    'gentle-lady': 3, 'cool-lady': 2, 'elegant-socialite': 3, 'smart-casual': 2,
    'minimal-lux': 1.5, 'vintage-hk': 1, 'literary-chic': 1, 'androgynous': 1.5,
    'new-chinese': 1.5, 'gothic-dark': 0.5,
  },
  edgy: {
    'dark-cool': 3, 'y2k': 2.5, 'western-hot': 2.5, 'street-sweet': 2,
    'pure-desire': 1.5, 'vintage-hk': 1, 'androgynous': 1.5, 'gothic-dark': 2.5,
    'outdoor-mountain': 1,
  },
  daily: {
    'street-sweet': 2, 'japanese-sweet': 2, 'french-lazy': 2, 'preppy-girl': 1.5,
    'smart-casual': 1.5, 'gentle-lady': 1, 'korean-sweet': 1, 'literary-chic': 1.5,
    'sporty-leisure': 2, 'outdoor-mountain': 1.5, 'androgynous': 1, 'new-chinese': 1,
  },
  minimal: {
    'minimal-lux': 3, 'cool-lady': 2.5, 'smart-casual': 1.5, 'dark-cool': 1,
    'androgynous': 2, 'literary-chic': 1, 'sporty-leisure': 1, 'new-chinese': 0.5,
  },
  budget: {
    'french-lazy': 1.5, 'street-sweet': 1.5, 'japanese-sweet': 1.5, 'preppy-girl': 1.5,
    'smart-casual': 1, 'korean-sweet': 1, 'y2k': 1, 'gentle-lady': 0.5,
    'elegant-socialite': -1, 'western-hot': -1, 'minimal-lux': -0.5,
    'literary-chic': 1, 'sporty-leisure': 1.5, 'outdoor-mountain': 1, 'androgynous': 0.5,
  },
  easyCare: {
    'smart-casual': 1.5, 'preppy-girl': 1.5, 'french-lazy': 1, 'japanese-sweet': 1,
    'minimal-lux': 1, 'gentle-lady': 1, 'street-sweet': 1, 'korean-sweet': 0.5,
    'literary-chic': 1, 'sporty-leisure': 2, 'outdoor-mountain': 1.5, 'androgynous': 1,
  },
}

/** 字段值归一化（发量/发质选项 → 风格数据中的取值） */
function norm(value: string | undefined | null): string {
  if (!value) return ''
  const map: Record<string, string> = {
    偏少: '少', 适中: '中', 偏多: '多',
  }
  return map[value] ?? value
}

/** 从当前发型描述推断发长（用于发长匹配，非绝对） */
export function deriveLength(current: string | undefined): string | null {
  if (!current) return null
  if (current.includes('短发')) return '短发'
  if (current.includes('锁骨')) return '中长发'
  if (current.includes('中长发')) return '中长发'
  if (current.includes('黑长直')) return '长发'
  return null
}

/** 判断 profile 是否命中某个特征 key（形如 face:鹅蛋脸） */
export function matchesTrait(profile: ImageProfile, key: string): boolean {
  const [field, value] = key.split(':')
  if (!value) return false
  switch (field) {
    case 'face':
      return profile.faceShape === value
    case 'skin':
      return profile.skinTone === value
    case 'tone':
      return profile.undertone === value
    case 'goal':
      return profile.goals.includes(value as never)
    case 'scenario':
      return profile.scenarios.includes(value as never)
    case 'comfort':
      return profile.comfort === value
    case 'budget':
      return profile.budget === value
    case 'hairLen':
      return deriveLength(profile.hair.current) === value
    case 'hairVol':
      return norm(profile.hair.volume) === value
    case 'hairTex':
      return norm(profile.hair.texture) === value
    default:
      return false
  }
}

/** 把命中的特征 key 转成可读的推荐理由（与用户已知信息关联） */
export function traitReason(key: string): string {
  const [field, value] = key.split(':')
  switch (field) {
    case 'face': return `你的脸型（${value}）与该风格的线条逻辑更匹配`
    case 'skin': return `你的肤色（${value}）更容易驾驭该风格的配色体系`
    case 'tone': return `你的肤色基调（${value}）与该风格常用色系契合`
    case 'goal': return `你的目标「${value}」正是该风格的强项`
    case 'scenario': return `能覆盖你的常驻场景「${value}」`
    case 'comfort': return `匹配你对舒适度的要求（${value}）`
    case 'budget': return `符合你的预算档位（${value}）`
    case 'hairLen': return `你的头发长度（${value}）更容易实现该风格`
    case 'hairVol': return `你的发量（${value}）与该风格的发型建议吻合`
    case 'hairTex': return `你的发质（${value}）适合该风格的发型打理`
    default: return `在「${field}:${value}」上与你的情况匹配`
  }
}

/** 对单个风格打分（不含 liked/disliked 之外的所有信息） */
export function scoreStyle(
  styleId: string,
  profile: ImageProfile,
  adjustments: AdjustmentKey[] = [],
): ScoredStyle {
  const style = getStyle(styleId)
  const reasons: string[] = []
  if (!style) return { styleId, score: 0, reasons }

  let score = 0
  for (const [key, weight] of Object.entries(style.traits)) {
    if (key.startsWith('liked:') || key.startsWith('disliked:')) continue
    if (matchesTrait(profile, key)) {
      score += weight
      reasons.push(traitReason(key))
    }
  }

  if (profile.likedStyles.includes(styleId)) {
    score += 8
    reasons.push('你自己也喜欢这个风格，保留较高优先级')
  }
  if (profile.dislikedStyles.includes(styleId)) {
    score -= 12
  }

  for (const adj of adjustments) {
    const w = ADJUSTMENT_WEIGHTS[adj]?.[styleId] ?? 0
    if (w !== 0) score += w
  }

  return { styleId, score, reasons }
}

/** 对全部风格排序打分 */
export function scoreAllStyles(
  profile: ImageProfile,
  adjustments: AdjustmentKey[] = [],
): ScoredStyle[] {
  return STYLES.map((s) => scoreStyle(s.id, profile, adjustments))
    .filter((s) => !profile.dislikedStyles.includes(s.styleId))
    .sort((a, b) => b.score - a.score)
}

/** 生成前三名与混合风格（seed 用于「换一批」轮换，0 表示不轮换） */
export function recommendStyles(
  profile: ImageProfile,
  adjustments: AdjustmentKey[] = [],
  seed = 0,
): { top: RecommendedStyle[]; mix: RecommendedStyle[] } {
  const scored = scoreAllStyles(profile, adjustments)
    .map((s) => (seed ? { ...s, score: s.score + seedJitter(s.styleId, seed) } : s))
    .sort((a, b) => b.score - a.score)
  const top3 = scored.slice(0, 3)

  const withFallback = (s: ScoredStyle): RecommendedStyle => ({
    styleId: s.styleId,
    score: Math.round(s.score * 10) / 10,
    reasons:
      s.reasons.length > 0
        ? s.reasons
        : ['在你的已知信息内暂无直接关联项，保留为可探索方向'],
    ratio: 0,
  })
  const top: RecommendedStyle[] = top3.map((s, i) => ({
    ...withFallback(s),
    ratio: i === 0 ? 60 : 40,
  }))

  // 混合风格：前两名按得分比例分配，第二名得分过低时仅保留一个
  let mix: RecommendedStyle[]
  const [first, second] = scored
  if (second && second.score > 0 && second.score >= 0.35 * Math.max(first.score, 1)) {
    const total = first.score + second.score
    const r1 = Math.round((first.score / total) * 100)
    mix = [
      { ...withFallback(first), ratio: r1 },
      { ...withFallback(second), ratio: 100 - r1 },
    ]
  } else {
    mix = [{ ...withFallback(first), ratio: 100 }]
  }

  return { top, mix }
}

/** 计算信息缺口：哪些信息缺失、对应哪些结论受影响 */
export function collectInfoGaps(profile: ImageProfile): string[] {
  const gaps: string[] = []
  const skipped = new Set(profile.skipped)

  if (!profile.facePhoto && skipped.has('facePhoto')) {
    gaps.push('未提供正面照片，风格与妆容分析基于你的自我描述')
  } else if (!profile.facePhoto && !skipped.has('facePhoto')) {
    gaps.push('尚未上传正面照片，建议补充以获得更贴合五官的建议')
  }
  if (!profile.bodyPhoto) gaps.push('未提供全身照片，版型与比例建议为通用原则')
  if (!profile.height) gaps.push('未提供身高信息，比例建议按通用原则给出')
  if (!profile.faceShape) gaps.push('未提供脸型信息，发型与修饰建议为通用方向')
  if (!profile.skinTone || !profile.undertone) {
    gaps.push('未提供肤色与色调信息，配色建议为通用方向')
  }
  if (!profile.personalColors.length) {
    gaps.push('未做个人色彩判断，色彩方案可再结合专业测色校准')
  }
  if (!profile.likedStyles.length && !profile.dislikedStyles.length) {
    gaps.push('未提供任何风格偏好，风格推荐的依据较弱')
  }
  if (!profile.goals.length) {
    gaps.push('未提供个人形象目标，推荐理由相对笼统')
  }
  return gaps
}
