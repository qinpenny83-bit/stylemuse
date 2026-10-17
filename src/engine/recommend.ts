/* ============================================================
 * 完整推荐结果组装：风格 + 妆容 + 发型 + 穿搭 + 场景 + 步骤
 * + 综合解读 / 采购清单 / 避坑提醒 / 分阶段计划
 * ============================================================ */

import type {
  AdjustmentKey,
  HairDesign,
  ImageProfile,
  MakeupDesign,
  OutfitDesign,
  PlanPhase,
  RecommendedHair,
  RecommendedMakeup,
  RecommendedOutfit,
  RecommendedStyle,
  Recommendation,
  SceneLook,
  ShoppingItem,
} from '../types'
import { getStyle } from '../data/styles'
import { MAKEUP_DESIGNS } from '../data/makeup'
import { HAIR_DESIGNS } from '../data/hair'
import { OUTFIT_DESIGNS } from '../data/outfits'
import { collectInfoGaps, recommendStyles, seedJitter, traitReason, deriveLength } from './score'

export const ADJUSTMENT_LABELS: Record<AdjustmentKey, string> = {
  cute: '更可爱一点',
  mature: '更成熟一点',
  edgy: '更有个性一点',
  daily: '更日常一点',
  minimal: '更简约一点',
  budget: '更符合预算',
  easyCare: '更容易打理',
}

const SCENARIO_MAKEUP_TYPE: Record<string, string[]> = {
  日常通勤: ['通勤', '日常', '清透'],
  学生: ['甜美', '日常', '甜酷'],
  校园: ['甜美', '日常', '甜酷'],
  约会: ['约会', '甜美', '水光'],
  朋友聚会: ['辣妹', '甜酷', '御姐', '复古'],
  商务正式: ['通勤', '御姐'],
  旅行度假: ['清透', '日常'],
  运动健身: ['清透', '日常'],
  节日派对: ['复古', '辣妹', '御姐'],
}

function pickMakeup(profile: ImageProfile, topStyleIds: string[], n: number, seed = 0): RecommendedMakeup[] {
  const chosen = new Set<string>()
  const result: RecommendedMakeup[] = []
  const scenarioTypes = profile.scenarios.flatMap((s) => SCENARIO_MAKEUP_TYPE[s] ?? [])

  const scored = MAKEUP_DESIGNS.map((m: MakeupDesign) => {
    let score = 0
    const overlap = m.styleIds.filter((id) => topStyleIds.includes(id)).length
    score += overlap * 2.5
    if (scenarioTypes.includes(m.type)) score += 2
    if (profile.skinTone && (m.suits.includes('全肤色') || m.suits.includes('通用'))) score += 0.5
    if (profile.comfort === '舒适优先') {
      if (m.difficulty === 1) score += 1
      if (m.difficulty === 3) score -= 1
    }
    if (profile.undertone === '冷调' && (m.type === '清透' || m.type === '御姐')) score += 0.5
    score += seedJitter(m.id, seed)
    return { m, score }
  }).sort((a, b) => b.score - a.score)

  for (const { m } of scored) {
    if (result.length >= n) break
    if (chosen.has(m.id)) continue
    chosen.add(m.id)
    const why =
      m.styleIds.filter((id) => topStyleIds.includes(id)).length > 0
        ? `与你的推荐风格（${m.styleIds.filter((id) => topStyleIds.includes(id)).map((id) => getStyle(id)?.name).filter(Boolean).join('、')}）契合`
        : `适合你的常驻场景「${profile.scenarios[0] ?? '日常'}」`
    result.push({
      designId: m.id,
      name: m.name,
      why,
      image: m.image,
      base: m.base,
      brows: m.brows,
      eyes: m.eyes,
      blush: m.blush,
      contour: m.contour,
      lips: m.lips,
      colors: m.colors,
      steps: m.steps,
      difficulty: m.difficulty,
      duration: m.duration,
      alternatives: m.alternatives,
      suits: m.suits,
    })
  }
  return result
}

function pickHair(profile: ImageProfile, topStyleIds: string[], n: number, seed = 0): RecommendedHair[] {
  const faceShape = profile.faceShape
  const careBudget = profile.hair.careTime ?? (profile.comfort === '舒适优先' ? 10 : 20)
  const currentLen = deriveLength(profile.hair.current)
  const result: RecommendedHair[] = []
  const chosen = new Set<string>()

  const scored = HAIR_DESIGNS.map((h: HairDesign) => {
    let score = 0
    const overlap = h.styleIds.filter((id) => topStyleIds.includes(id)).length
    score += overlap * 2.5
    if (faceShape && h.faceShapes.includes(faceShape)) score += 2
    if (currentLen && h.length === currentLen) score += 1.5
    if (h.careTime <= careBudget) score += 2
    else if (h.careTime <= careBudget + 5) score += 0.5
    if (profile.hair.volume && h.hairVolume.includes(profile.hair.volume)) score += 1
    if (profile.hair.texture && h.hairQuality.includes(profile.hair.texture)) score += 1
    score += seedJitter(h.id, seed)
    return { h, score }
  }).sort((a, b) => b.score - a.score)

  for (const { h } of scored) {
    if (result.length >= n) break
    if (chosen.has(h.id)) continue
    chosen.add(h.id)
    const whyParts: string[] = []
    if (faceShape && h.faceShapes.includes(faceShape)) whyParts.push(`适配你的脸型（${faceShape}）`)
    if (h.careTime <= careBudget) whyParts.push(`日常打理约 ${h.careTime} 分钟，在你的可接受范围内`)
    if (currentLen && h.length === currentLen) whyParts.push(`与你的当前发长（${currentLen}）一致，改动成本低`)
    if (!whyParts.length) whyParts.push('风格契合度较高')
    result.push({
      designId: h.id,
      name: h.name,
      why: whyParts.join('；'),
      image: h.image,
      length: h.length,
      texture: h.texture,
      bangs: h.bangs,
      colors: h.colors,
      careTime: h.careTime,
      careLevel: h.careLevel,
      reasons: h.reasons,
      limitations: h.limitations,
      salonBrief: h.salonBrief,
    })
  }
  return result
}

function pickOutfits(profile: ImageProfile, topStyleIds: string[], n: number, seed = 0): RecommendedOutfit[] {
  const scenarios = profile.scenarios
  const budget = profile.budget
  const result: RecommendedOutfit[] = []
  const chosen = new Set<string>()

  const scored = OUTFIT_DESIGNS.map((o: OutfitDesign) => {
    let score = 0
    const overlap = o.styleIds.filter((id) => topStyleIds.includes(id)).length
    score += overlap * 2.5
    if (scenarios.includes(o.scenario)) score += 3
    if (o.scenario === '日常' && profile.comfort === '舒适优先') score += 1
    if (budget) {
      if (o.budget === budget) score += 2
      else if (budget === '低' && o.budget === '中') score += 1
      else if (budget === '高') score += 1
    }
    score += seedJitter(o.id, seed)
    return { o, score }
  }).sort((a, b) => b.score - a.score)

  for (const { o } of scored) {
    if (result.length >= n) break
    if (chosen.has(o.id)) continue
    chosen.add(o.id)
    const whyParts: string[] = []
    if (scenarios.includes(o.scenario)) whyParts.push(`覆盖你的场景「${o.scenario}」`)
    if (overlapOf(o.styleIds, topStyleIds) > 0) {
      const names = o.styleIds.filter((id) => topStyleIds.includes(id)).map((id) => getStyle(id)?.name).filter(Boolean)
      whyParts.push(`对应推荐风格（${names.join('、')}）`)
    }
    if (budget && o.budget === budget) whyParts.push(`匹配你的预算（${budget}）`)
    if (!whyParts.length) whyParts.push('搭配完整度高，可直接参考')
    result.push({
      designId: o.id,
      name: o.name,
      why: whyParts.join('；'),
      image: o.image,
      scenario: o.scenario,
      seasons: o.seasons,
      budget: o.budget,
      top: o.top,
      bottom: o.bottom,
      dress: o.dress,
      outer: o.outer,
      shoes: o.shoes,
      bag: o.bag,
      accessories: o.accessories,
      palette: o.palette,
      fit: o.fit,
      reason: o.reason,
      comfort: o.comfort,
      exposure: o.exposure,
      complexity: o.complexity,
    })
  }
  return result
}

function overlapOf(a: string[], b: string[]): number {
  return a.filter((x) => b.includes(x)).length
}

/** 为某个场景构建可执行的单品组合（优先用匹配的穿搭方案，否则用主风格入门方案拆解） */
function buildLookForScenario(scenario: string, topStyleIds: string[], styleNames: string[]): string[] {
  const matched = OUTFIT_DESIGNS.filter((o) => o.scenario === scenario)
    .sort((a, b) => overlapOf(b.styleIds, topStyleIds) - overlapOf(a.styleIds, topStyleIds))[0]
  if (matched) {
    const parts = [matched.top, matched.bottom ?? matched.dress, matched.outer, matched.shoes, matched.bag]
      .filter(Boolean) as string[]
    if (parts.length >= 3) return parts
  }
  // 兜底：从主推风格入门方案拆解
  const main = getStyle(topStyleIds[0])
  const starter = main?.starterLook[0]
  if (starter) return starter.split('+').map((s) => s.trim()).filter(Boolean)
  return [`以「${styleNames[0] ?? '推荐风格'}」的基础单品组合（上衣+裤/裙+鞋）`]
}

function buildSceneLooks(profile: ImageProfile, topStyles: RecommendedStyle[]): SceneLook[] {
  const styleNames = topStyles.map((s) => getStyle(s.styleId)?.name ?? '')
  const topStyleIds = topStyles.map((s) => s.styleId)
  const preferred = profile.scenarios.slice(0, 3)
  // 场景不足 3 个时按风格补充常用场景
  const fallbackScenes = ['日常通勤', '约会', '朋友聚会'].filter((s) => !preferred.includes(s))
  const scenes = preferred.length >= 3 ? preferred : [...preferred, ...fallbackScenes].slice(0, 3)

  const tipByScenario: Record<string, string> = {
    日常通勤: `用「${styleNames[0] ?? '推荐风格'}」的色系做同色系搭配，配一只通勤托特包即可切换职场状态`,
    学生: `从校园场景入手：${styleNames.slice(0, 2).filter(Boolean).join(' + ') || '推荐风格'}的经典组合（针织/卫衣+半裙或直筒裤）`,
    校园: `从校园场景入手：${styleNames.slice(0, 2).filter(Boolean).join(' + ') || '推荐风格'}的经典组合（针织/卫衣+半裙或直筒裤）`,
    约会: `约会时保留${styleNames[0] ?? '推荐风格'}的核心单品，换成一件缎面/针织质感单品提升氛围`,
    朋友聚会: `聚会场合用${styleNames[0] ?? '推荐风格'}的「一件出彩单品」（西装/亮色/金属配饰）撑起存在感`,
    商务正式: `商务场景收缩为${styleNames[0] ?? '推荐风格'}的正式版：衬衫/西装+直筒下装，妆容切到通勤款`,
    旅行度假: `旅行采用${styleNames[0] ?? '推荐风格'}的叠穿公式：可脱外搭+舒适鞋履+一只点睛配饰`,
    运动健身: `健身前后用${styleNames[0] ?? '推荐风格'}的宽松款：卫衣+工装/运动裤，妆容只留清透打底`,
    节日派对: `派对日放大${styleNames[0] ?? '推荐风格'}的氛围感：红唇/光泽妆+一件派对感单品`,
  }
  return scenes.map((s) => ({
    scenario: s,
    tip: tipByScenario[s] ?? `日常使用${styleNames[0] ?? '推荐风格'}的基础公式即可`,
    look: buildLookForScenario(s, topStyleIds, styleNames),
  }))
}

/** 综合解读：结合用户已知特征解释「为什么是这个组合」 */
function buildSummary(profile: ImageProfile, top: RecommendedStyle[]): string {
  const parts: string[] = []
  const main = getStyle(top[0]?.styleId)
  const second = getStyle(top[1]?.styleId)
  if (main) {
    parts.push(`整体方案以「${main.name}」为骨架${second ? `，混入「${second.name}」的元素做点睛` : ''}`)
  }
  if (profile.faceShape) {
    parts.push(`发型与领型设计会优先配合你的脸型（${profile.faceShape}）`)
  }
  if (profile.skinTone && profile.undertone) {
    parts.push(`色彩方案按你的肤色（${profile.skinTone}·${profile.undertone}）方向取色`)
  } else if (profile.skinTone) {
    parts.push(`色彩方案以你的肤色（${profile.skinTone}）作为适配参考`)
  }
  if (profile.goals.length) {
    parts.push(`你的目标（${profile.goals.join('、')}）已在风格选择与单品优先级中考虑`)
  }
  if (profile.scenarios.length) {
    parts.push(`常驻场景（${profile.scenarios.slice(0, 2).join('、')}${profile.scenarios.length > 2 ? ' 等' : ''}）由下方场景穿搭逐套覆盖`)
  }
  return (parts.length ? parts.join('；') : '在你已提供的信息基础上，给出以下可执行的方向') + '。'
}

/** 采购清单：按优先级排列，优先从入门方案与配饰提取 */
function buildShoppingList(profile: ImageProfile, top: RecommendedStyle[], makeup: RecommendedMakeup[], hair: RecommendedHair[]): ShoppingItem[] {
  const items: ShoppingItem[] = []
  const main = getStyle(top[0]?.styleId)
  const budgetNote: Record<string, string> = {
    低: '选平价基础款即可，优先买上衣与鞋',
    中: '核心单品（外套/鞋包）值得适度投资',
    高: '注重面料与剪裁，数量少而精',
  }
  const note = profile.budget ? budgetNote[profile.budget] : undefined

  if (main) {
    const firstLook = main.starterLook[0]?.split('+').map((s) => s.trim()).filter(Boolean) ?? []
    firstLook.forEach((item, i) => {
      const priority: ShoppingItem['priority'] = i === 0 ? '高' : i === 1 ? '高' : '中'
      items.push({ item, priority, note: i === 0 ? '这套是风格的第一眼印象，优先置办' : undefined })
    })
    const secondLook = main.starterLook[1]?.split('+').map((s) => s.trim()).filter(Boolean) ?? []
    secondLook.slice(0, 2).forEach((item) => {
      if (!items.some((x) => x.item === item)) items.push({ item, priority: '中' })
    })
    main.accessories.slice(0, 3).forEach((item) => {
      if (!items.some((x) => x.item === item)) items.push({ item, priority: '低', note: '配饰是提升风格完成度最快的单品' })
    })
  }
  const lip = makeup[0]?.lips
  if (lip && !items.some((x) => x.item.includes('唇'))) {
    items.push({ item: `口红一支（${lip}方向）`, priority: '中', note: '妆容预算内最值得投资的一件' })
  }
  const hairColor = hair[0]?.colors?.[0]
  if (hairColor && !items.some((x) => x.item.includes('染'))) {
    items.push({ item: `发色参考（${hairColor}）`, priority: '低', note: '换色前先用假发片/染发剂试色' })
  }
  if (note && items.length) items[items.length - 1] = { ...items[items.length - 1], note: `${items[items.length - 1].note ?? ''}${items[items.length - 1].note ? '；' : ''}${note}` }
  return items.slice(0, 8)
}

/** 避坑提醒：来自主推风格的常见误区 */
function buildAvoidMistakes(top: RecommendedStyle[]): string[] {
  const main = getStyle(top[0]?.styleId)
  if (!main?.mistakes?.length) return []
  return main.mistakes.slice(0, 3)
}

/** 分阶段改造计划（时间线视角） */
function buildPlan(top: RecommendedStyle[], makeup: RecommendedMakeup[], hair: RecommendedHair[]): PlanPhase[] {
  const main = getStyle(top[0]?.styleId)
  const phases: PlanPhase[] = [
    {
      phase: '第 1-2 周 · 摸底与打底',
      actions: [
        '确认主推风格与混合比例，通读对应风格的「入门搭配方案」',
        main ? `按第一套入门方案置办三件核心单品（${main.starterLook[0]?.split('+').slice(0, 3).map((s) => s.trim()).join('、')}）` : '按推荐穿搭置办第一身完整搭配',
        makeup[0] ? `练习「${makeup[0].name}」妆容（约 ${makeup[0].duration ?? '20'} 分钟），掌握底妆与唇色两个重点` : '练习推荐妆容的基础步骤',
      ],
    },
    {
      phase: '第 3-4 周 · 建立公式',
      actions: [
        '固定 3 套「穿搭公式」（工作/约会/休闲各一套），每天按公式快速出门',
        '用主推风格的核心色系统一衣橱：把旧单品按色板重搭，逐步换掉出挑的杂色',
        hair[0] ? `发型：按「${hair[0].salonBrief ?? hair[0].name}」的需求去理发店沟通，或先尝试同款造型` : '考虑发型与发色调整，低风险先试造型',
      ],
    },
    {
      phase: '第 5-8 周 · 深化与混搭',
      actions: [
        '加入配饰点睛（主推风格配饰清单中选 1-2 件），提升完整度',
        '尝试「第二风格」的混搭：用 20% 比例的单品做变化，找到舒适区边缘',
        '每周复盘：把效果好的搭配收藏到「我的衣橱」，淘汰不合适的，记录穿得最多的 3 套',
      ],
    },
  ]
  return phases
}

function buildSteps(
  profile: ImageProfile,
  topStyles: RecommendedStyle[],
  makeup: { designId: string; name: string }[],
  hair: { designId: string; name: string }[],
  outfits: { designId: string; name: string }[],
): string[] {
  const main = getStyle(topStyles[0]?.styleId)
  const steps: string[] = []
  if (main) {
    steps.push(`从「${main.name}」的入门方案开始：${main.starterLook[0]}`)
  }
  if (makeup[0]) steps.push(`掌握「${makeup[0].name}」：这是上手成本最低、与推荐风格最匹配的妆容`)
  if (hair[0]) steps.push(`发型：向理发师描述「${hair[0].name}」的需求（详情见发型详情页），或先尝试同款造型`)
  if (outfits[0]) steps.push(`按「${outfits[0].name}」置办第一身完整搭配，优先购买上衣+下装+鞋三件核心单品`)
  steps.push('用推荐风格的核心色系（见风格详情页配色）替换现有衣橱中的同类单品，逐步统一色板')
  steps.push('收藏喜欢的风格与方案到「我的衣橱」，每周复盘一次，保留 3 套固定「穿搭公式」')
  if (profile.likedStyles.length === 0) {
    steps.push('建议到「风格探索中心」逛逛，把喜欢的风格加入档案，推荐会随你的偏好更新')
  }
  return steps.slice(0, 7)
}

/** 生成完整推荐结果（seed 用于「换一批」轮换，0 表示不轮换） */
export function buildRecommendation(profile: ImageProfile, adjustments: AdjustmentKey[] = [], seed = 0): Recommendation {
  const { top, mix } = recommendStyles(profile, adjustments, seed)
  const topIds = top.map((s) => s.styleId)

  const makeup = pickMakeup(profile, topIds, 3, seed)
  const hair = pickHair(profile, topIds, 3, seed)
  const outfits = pickOutfits(profile, topIds, 4, seed)
  const sceneLooks = buildSceneLooks(profile, top)
  const steps = buildSteps(profile, top, makeup, hair, outfits)
  const infoGaps = collectInfoGaps(profile)

  return {
    id: crypto.randomUUID(),
    profileId: profile.id,
    createdAt: new Date().toISOString(),
    profileSnapshot: {
      faceShape: profile.faceShape,
      skinTone: profile.skinTone,
      undertone: profile.undertone,
      likedStyles: profile.likedStyles,
      scenarios: profile.scenarios,
      goals: profile.goals,
      skipped: profile.skipped,
      height: profile.height,
    },
    topStyles: top,
    mix,
    summary: buildSummary(profile, top),
    makeup,
    hair,
    outfits,
    sceneLooks,
    steps,
    shoppingList: buildShoppingList(profile, top, makeup, hair),
    avoidMistakes: buildAvoidMistakes(top),
    plan: buildPlan(top, makeup, hair),
    infoGaps,
    appliedAdjustments: adjustments,
  }
}

/** 调整个性化标签（用于结果页说明调整效果） */
export function adjustmentBlurb(adj: AdjustmentKey): string {
  return ADJUSTMENT_LABELS[adj]
}

export { traitReason }
