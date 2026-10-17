import { describe, expect, it } from 'vitest'
import type { ImageProfile } from '../types'
import { collectInfoGaps, recommendStyles, scoreAllStyles, deriveLength, matchesTrait, traitReason } from './score'
import { buildRecommendation } from './recommend'

function baseProfile(overrides: Partial<ImageProfile> = {}): ImageProfile {
  return {
    id: 'p-test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    step: 0,
    completed: false,
    facePhoto: null,
    bodyPhoto: null,
    height: null,
    body: null,
    faceShape: null,
    faceFeatures: [],
    skinTone: null,
    undertone: null,
    personalColors: [],
    hair: {},
    likedStyles: [],
    dislikedStyles: [],
    scenarios: [],
    budget: null,
    comfort: null,
    goals: [],
    selfDescription: '',
    skipped: [],
    ...overrides,
  }
}

describe('scoreAllStyles', () => {
  it('空档案不抛错，返回全部 22 个风格且可排序', () => {
    const scored = scoreAllStyles(baseProfile())
    expect(scored.length).toBe(22)
    expect(scored[0].score).toBeGreaterThanOrEqual(scored[21].score)
  })

  it('用户喜欢的风格获得显著加分并进入前列', () => {
    const profile = baseProfile({ likedStyles: ['ballet-core'] })
    const scored = scoreAllStyles(profile)
    const ballet = scored.find((s) => s.styleId === 'ballet-core')!
    expect(ballet.score).toBeGreaterThanOrEqual(6)
    expect(scored[0].styleId).toBe('ballet-core')
  })

  it('扩展风格参与打分：喜欢新中式时进入前列', () => {
    const profile = baseProfile({
      likedStyles: ['new-chinese'],
      goals: ['高级感'],
      scenarios: ['节日派对'],
    })
    const scored = scoreAllStyles(profile)
    const nc = scored.find((s) => s.styleId === 'new-chinese')!
    expect(nc.score).toBeGreaterThanOrEqual(6)
    expect(scored[0].styleId).toBe('new-chinese')
    expect(nc.reasons.some((r) => r.includes('新中式') || r.includes('高级感'))).toBe(true)
  })

  it('用户讨厌的风格被排除', () => {
    const profile = baseProfile({ dislikedStyles: ['dark-cool'] })
    const scored = scoreAllStyles(profile)
    expect(scored.some((s) => s.styleId === 'dark-cool')).toBe(false)
  })

  it('脸型信息影响对应风格的分数与理由', () => {
    const profile = baseProfile({ faceShape: '圆脸' })
    const scored = scoreAllStyles(profile)
    const sweet = scored.find((s) => s.styleId === 'japanese-sweet')!
    expect(sweet.score).toBeGreaterThan(0)
    expect(sweet.reasons.some((r) => r.includes('圆脸'))).toBe(true)
  })

  it('调整「更可爱」会提升甜美系风格排序', () => {
    const plain = scoreAllStyles(baseProfile())
    const cute = scoreAllStyles(baseProfile(), ['cute'])
    const plainRank = (arr: typeof plain, id: string) => arr.findIndex((s) => s.styleId === id)
    // 空档案下排序等同于数据顺序，用非首位的芭蕾甜心验证提升
    expect(plainRank(cute, 'ballet-core')).toBeLessThan(plainRank(plain, 'ballet-core'))
    expect(cute.find((s) => s.styleId === 'ballet-core')!.score).toBeGreaterThan(
      plain.find((s) => s.styleId === 'ballet-core')!.score,
    )
  })
})

describe('recommendStyles', () => {
  it('返回前三名与混合风格，比例和为 100', () => {
    const profile = baseProfile({
      likedStyles: ['korean-sweet'],
      faceShape: '鹅蛋脸',
      goals: ['减龄'],
      scenarios: ['约会'],
    })
    const { top, mix } = recommendStyles(profile)
    expect(top.length).toBe(3)
    expect(mix.reduce((sum, m) => sum + m.ratio, 0)).toBe(100)
    expect(top[0].styleId).toBe('korean-sweet')
  })

  it('混合风格在前两名得分接近时包含两个风格', () => {
    const profile = baseProfile({
      likedStyles: ['gentle-lady', 'minimal-lux'],
      goals: ['高级感', '利落'],
      scenarios: ['通勤'],
      comfort: '精致优先',
    })
    const { mix } = recommendStyles(profile)
    expect(mix.length).toBe(2)
  })
})

describe('collectInfoGaps', () => {
  it('信息不全时明确列出缺口，不编造分析', () => {
    const gaps = collectInfoGaps(baseProfile({ skipped: ['facePhoto'] }))
    expect(gaps.length).toBeGreaterThanOrEqual(5)
    expect(gaps.some((g) => g.includes('照片'))).toBe(true)
    expect(gaps.some((g) => g.includes('脸型'))).toBe(true)
  })
})

describe('deriveLength / matchesTrait', () => {
  it('从当前发型描述推断发长', () => {
    expect(deriveLength('黑长直')).toBe('长发')
    expect(deriveLength('短发')).toBe('短发')
    expect(deriveLength('锁骨发')).toBe('中长发')
    expect(deriveLength(undefined)).toBeNull()
  })

  it('matchesTrait 正确处理发量归一化', () => {
    const p = baseProfile({ hair: { volume: '偏多' } })
    expect(matchesTrait(p, 'hairVol:多')).toBe(true)
    expect(matchesTrait(p, 'hairVol:少')).toBe(false)
  })

  it('traitReason 输出可读中文理由', () => {
    expect(traitReason('face:圆脸')).toContain('圆脸')
    expect(traitReason('goal:减龄')).toContain('减龄')
  })
})

describe('buildRecommendation', () => {
  it('完整推荐包含风格/妆容/发型/穿搭/场景/步骤/缺口', () => {
    const profile = baseProfile({
      likedStyles: ['street-sweet'],
      scenarios: ['日常', '约会'],
      goals: ['减龄', '有个性'],
      comfort: '舒适优先',
      faceShape: '圆脸',
      hair: { texture: '适中', volume: '偏多', current: '中长发', careTime: 15 },
      budget: '低',
    })
    const rec = buildRecommendation(profile)
    expect(rec.topStyles.length).toBe(3)
    expect(rec.mix.length).toBeGreaterThanOrEqual(1)
    expect(rec.makeup.length).toBe(3)
    expect(rec.hair.length).toBe(3)
    expect(rec.outfits.length).toBe(4)
    expect(rec.sceneLooks.length).toBeGreaterThanOrEqual(1)
    expect(rec.steps.length).toBeGreaterThanOrEqual(3)
    expect(rec.appliedAdjustments).toEqual([])
  })

  it('每个妆容/发型/穿搭推荐都附带示意图字段', () => {
    const profile = baseProfile({
      likedStyles: ['korean-sweet'],
      scenarios: ['日常'],
      goals: ['减龄'],
      faceShape: '圆脸',
      hair: { texture: '适中', volume: '偏多', current: '中长发', careTime: 15 },
    })
    const rec = buildRecommendation(profile)
    for (const m of rec.makeup) expect(m.image).toBeTruthy()
    for (const h of rec.hair) expect(h.image).toBeTruthy()
    for (const o of rec.outfits) expect(o.image).toBeTruthy()
  })

  it('换一批：不同 seed 打乱次要方案，高分核心风格保持稳定', () => {
    const profile = baseProfile({
      likedStyles: ['korean-sweet'],
      goals: ['减龄'],
      scenarios: ['约会'],
      faceShape: '鹅蛋脸',
    })
    const a = buildRecommendation(profile, [], 0)
    const b = buildRecommendation(profile, [], 1)
    const c = buildRecommendation(profile, [], 2)
    // 核心首推风格在所有 seed 下一致
    expect(b.topStyles[0].styleId).toBe(a.topStyles[0].styleId)
    expect(c.topStyles[0].styleId).toBe(a.topStyles[0].styleId)
    // 同 seed 结果确定性一致（可直接复现）
    expect(buildRecommendation(profile, [], 1).topStyles[0].styleId).toBe(b.topStyles[0].styleId)
    // 妆容/发型/穿搭的次要项随 seed 发生变化，不会永远一样
    const ids = (arr: { designId: string }[]) => arr.map((x) => x.designId).join(',')
    const sets = [a, b, c].map((r) => `${ids(r.makeup)}|${ids(r.hair)}|${ids(r.outfits)}`)
    expect(new Set(sets).size).toBeGreaterThan(1)
  })

  it('推荐细节充分：妆容带执行信息，穿搭带完整单品，含总结/采购/避坑/计划', () => {
    const profile = baseProfile({
      likedStyles: ['french-lazy'],
      scenarios: ['日常通勤', '约会', '旅行度假'],
      goals: ['高级感', '亲和力'],
      comfort: '平衡',
      faceShape: '鹅蛋脸',
      hair: { texture: '适中', volume: '偏多', current: '中长发', careTime: 15 },
      budget: '中',
    })
    const rec = buildRecommendation(profile)
    expect(rec.summary).toBeTruthy()
    expect(rec.makeup[0]).toMatchObject({
      designId: expect.any(String),
      base: expect.any(String),
      lips: expect.any(String),
      steps: expect.any(Array),
      duration: expect.any(Number),
    })
    expect(rec.hair[0].salonBrief).toBeTruthy()
    expect(rec.outfits[0]).toMatchObject({
      top: expect.any(String),
      shoes: expect.any(String),
      bag: expect.any(String),
    })
    expect(rec.sceneLooks.every((s) => Array.isArray(s.look) && s.look!.length >= 3)).toBe(true)
    expect(rec.shoppingList!.length).toBeGreaterThanOrEqual(3)
    expect(rec.shoppingList![0].priority).toBe('高')
    expect(rec.avoidMistakes!.length).toBeGreaterThanOrEqual(1)
    expect(rec.plan!.length).toBe(3)
    expect(rec.plan![0].actions.length).toBeGreaterThanOrEqual(1)
  })

  it('每个推荐理由都来自用户已知信息，或明确标注信息不足', () => {
    const profile = baseProfile({ likedStyles: ['french-lazy'] })
    const rec = buildRecommendation(profile, ['budget'])
    expect(rec.appliedAdjustments).toEqual(['budget'])
    for (const s of rec.topStyles) {
      expect(s.reasons.length).toBeGreaterThanOrEqual(1)
    }
    expect(rec.infoGaps.length).toBeGreaterThan(0)
  })
})
