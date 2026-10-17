/* ============================================================
 * 胶囊衣橱：常见基础单品清单 + 生成今日穿搭 + 补购建议
 * 面向新手：勾选已有单品，把现有的衣服穿好看
 * ============================================================ */

export type CapsuleCategory = '上衣' | '下装' | '连衣裙' | '外套' | '鞋' | '包'
export type Occasion = '通勤' | '休闲' | '约会' | '聚会'
export type Season = '春' | '夏' | '秋' | '冬'

export interface CapsuleItem {
  id: string
  name: string
  category: CapsuleCategory
  occasions: Occasion[]
  /** 未列出季节 = 四季皆宜 */
  seasons?: Season[]
}

export const CAPSULE_ITEMS: CapsuleItem[] = [
  // 上衣
  { id: 'white-tee', name: '白T恤', category: '上衣', occasions: ['通勤', '休闲', '约会'], seasons: ['春', '夏'] },
  { id: 'stripe-top', name: '条纹衫', category: '上衣', occasions: ['休闲', '约会'], seasons: ['春', '夏', '秋'] },
  { id: 'knit-cardigan', name: '针织开衫', category: '上衣', occasions: ['通勤', '休闲', '约会'], seasons: ['春', '秋', '冬'] },
  { id: 'shirt', name: '衬衫', category: '上衣', occasions: ['通勤', '休闲'], seasons: ['春', '夏', '秋'] },
  { id: 'sweatshirt', name: '卫衣', category: '上衣', occasions: ['休闲'], seasons: ['秋', '冬'] },
  { id: 'blouse', name: '雪纺衬衫', category: '上衣', occasions: ['通勤', '约会', '聚会'], seasons: ['春', '夏'] },
  { id: 'base-layer', name: '修身打底衫', category: '上衣', occasions: ['通勤', '约会'], seasons: ['秋', '冬'] },
  // 下装
  { id: 'straight-jeans', name: '直筒牛仔裤', category: '下装', occasions: ['通勤', '休闲', '约会'] },
  { id: 'wide-pants', name: '阔腿裤', category: '下装', occasions: ['通勤', '约会'], seasons: ['春', '秋'] },
  { id: 'a-skirt', name: 'A字半裙', category: '下装', occasions: ['约会', '聚会'], seasons: ['春', '夏'] },
  { id: 'trouser', name: '西装裤', category: '下装', occasions: ['通勤', '聚会'] },
  { id: 'pleated-skirt', name: '百褶裙', category: '下装', occasions: ['约会', '聚会', '休闲'], seasons: ['春', '秋'] },
  { id: 'shorts', name: '牛仔短裤', category: '下装', occasions: ['休闲'], seasons: ['夏'] },
  // 连衣裙
  { id: 'shirt-dress', name: '衬衫连衣裙', category: '连衣裙', occasions: ['通勤', '约会'], seasons: ['春', '夏'] },
  { id: 'knit-dress', name: '针织连衣裙', category: '连衣裙', occasions: ['约会', '聚会'], seasons: ['秋', '冬'] },
  { id: 'little-black-dress', name: '小黑裙', category: '连衣裙', occasions: ['聚会', '约会'] },
  // 外套
  { id: 'blazer', name: '西装外套', category: '外套', occasions: ['通勤', '聚会'], seasons: ['春', '秋'] },
  { id: 'trench', name: '风衣', category: '外套', occasions: ['通勤', '约会'], seasons: ['春', '秋'] },
  { id: 'denim-jacket', name: '牛仔外套', category: '外套', occasions: ['休闲'], seasons: ['春', '秋'] },
  { id: 'leather-jacket', name: '皮衣', category: '外套', occasions: ['聚会', '约会'], seasons: ['秋', '冬'] },
  { id: 'down-coat', name: '羽绒服', category: '外套', occasions: ['通勤', '休闲'], seasons: ['冬'] },
  // 鞋
  { id: 'white-sneakers', name: '小白鞋', category: '鞋', occasions: ['通勤', '休闲', '约会'] },
  { id: 'loafers', name: '乐福鞋', category: '鞋', occasions: ['通勤', '聚会'], seasons: ['春', '秋'] },
  { id: 'ankle-boots', name: '短靴', category: '鞋', occasions: ['约会', '聚会', '通勤'], seasons: ['秋', '冬'] },
  { id: 'heels', name: '尖头高跟鞋', category: '鞋', occasions: ['聚会', '约会'] },
  // 包
  { id: 'tote', name: '托特包', category: '包', occasions: ['通勤', '休闲'] },
  { id: 'shoulder-bag', name: '腋下包', category: '包', occasions: ['约会', '聚会'] },
  { id: 'canvas-bag', name: '帆布包', category: '包', occasions: ['休闲'] },
]

const itemMap = new Map(CAPSULE_ITEMS.map((it) => [it.id, it]))

export interface GeneratedLook {
  id: string
  name: string
  /** 搭配逻辑一句话 */
  note: string
  items: CapsuleItem[]
}

const NOTES: Record<Occasion, Record<Season, string>> = {
  通勤: { 春: '同色系叠穿更显干练，浅色系提气色。', 夏: '浅色上衣配深色下装，清爽又专业。', 秋: '衬衫外搭针织开衫，层次感自然。', 冬: '打底衫+大衣叠穿，保暖又有型。' },
  休闲: { 春: '上松下紧的穿法，舒服不邋遢。', 夏: '宽松上衣配短裤，清凉一夏。', 秋: '卫衣配直筒裤，穿出松弛感。', 冬: '内搭厚实打底，外面随意套外套。' },
  约会: { 春: '裙装或浅色系，温柔有氛围。', 夏: '露肤留一处：肩、腿或腰选一个。', 秋: '针织+半裙，慵懒又精致。', 冬: '修身打底+长大衣，利落显比例。' },
  聚会: { 春: '加入一点亮色或配饰做记忆点。', 夏: '小黑裙配亮色包，经典不出错。', 秋: '西装外套配阔腿裤，气场在线。', 冬: '皮衣或亮色配饰，室内脱外套也好看。' },
}

function seasonMatches(it: CapsuleItem, season: Season): boolean {
  return !it.seasons || it.seasons.includes(season)
}

/** 生成 3 套今日穿搭（优先用与场合/季节匹配的已有单品） */
export function generateLooks(
  ownedIds: string[],
  scenario: Occasion,
  season: Season,
): GeneratedLook[] {
  const owned = ownedIds.map((id) => itemMap.get(id)).filter((it): it is CapsuleItem => Boolean(it))
  const matched = owned.filter((it) => it.occasions.includes(scenario) && seasonMatches(it, season))
  const pool = matched.length >= 3 ? matched : owned
  const note = NOTES[scenario][season]

  const byCategory = (c: CapsuleCategory) => pool.filter((it) => it.category === c)

  const looks: GeneratedLook[] = []
  // 1) 连衣裙式
  const dress = byCategory('连衣裙')[0]
  if (dress) {
    looks.push({
      id: 'look-dress',
      name: '连衣裙 · 省心套',
      note: dress.occasions.includes(scenario) ? note : '一条裙子解决出门问题，鞋包点睛。',
      items: [dress, byCategory('鞋')[0] ?? byCategory('外套')[0], byCategory('包')[0]].filter(Boolean) as CapsuleItem[],
    })
  }
  // 2) 两件套
  const top = byCategory('上衣')[0]
  const bottom = byCategory('下装')[0]
  if (top && bottom) {
    looks.push({
      id: 'look-two-piece',
      name: '上衣 + 下装 · 基础套',
      note,
      items: [top, bottom, byCategory('鞋')[0] ?? top, byCategory('包')[0] ?? bottom].filter(Boolean) as CapsuleItem[],
    })
  }
  // 3) 叠穿套
  const tops = byCategory('上衣')
  const top2 = tops[1] ?? tops[0]
  const outer = byCategory('外套')[0]
  if (top && bottom && (outer || top2)) {
    looks.push({
      id: 'look-layered',
      name: '叠穿 · 层次套',
      note: outer ? '外套+内搭形成层次，脱掉外套也完整。' : note,
      items: [outer ?? top2, top, bottom, byCategory('鞋')[1] ?? byCategory('鞋')[0], byCategory('包')[0]].filter(Boolean) as CapsuleItem[],
    })
  }
  // 兜底：单品太少时给出通用提示
  if (looks.length === 0) {
    looks.push({
      id: 'look-basic',
      name: '先从基础件开始',
      note: '目前可选单品还不太够，先补一件上衣或下装就能搭起来。',
      items: owned.slice(0, 3),
    })
  }
  return looks
}

/** 补购建议：缺的类别给出 1 件代表单品，最多 3 条 */
export function suggestShopping(ownedIds: string[], season: Season): { item: CapsuleItem; reason: string }[] {
  const tips: { item: CapsuleItem; reason: string }[] = []
  const categoryCover = new Set<string>()
  for (const id of ownedIds) {
    const it = itemMap.get(id)
    if (it) categoryCover.add(it.category)
  }
  const priorities: CapsuleCategory[] = season === '冬' ? ['外套', '上衣', '下装', '鞋', '包'] : ['上衣', '下装', '外套', '鞋', '包']
  for (const cat of priorities) {
    if (categoryCover.has(cat)) continue
    const candidate = CAPSULE_ITEMS.find((it) => it.category === cat && seasonMatches(it, season)) ?? CAPSULE_ITEMS.find((it) => it.category === cat)
    if (candidate) tips.push({ item: candidate, reason: `衣柜里还没有${cat}，这件最百搭` })
    if (tips.length >= 3) break
  }
  return tips
}
