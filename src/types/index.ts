/* ============================================================
 * StyleMuse 核心类型定义
 * 统一的数据结构：风格 / 妆容 / 发型 / 穿搭 / 用户档案 / 推荐结果
 * ============================================================ */

/** 图片引用：图片与内容分离管理，记录来源与许可情况 */
export interface ImageRef {
  /** 本地固定图片（优先级高于 prompt 动态生成，例如已确认质量的示意大图） */
  src?: string
  /** 生成示意图的提示词（用于 text_to_image 服务） */
  prompt: string
  /** 替代文本 */
  alt: string
  /** 来源类型 */
  source: 'ai-generated' | 'author-photo' | 'user-upload' | 'placeholder'
  /** 许可说明 */
  license: string
  /** 用途限制 */
  restrictions: string
  /** 图片加载失败时的占位底色（与图片主色调接近） */
  fallbackColor: string
  /** 占位渐变第二色 */
  fallbackColor2?: string
}

/* ---------------- 风格 ---------------- */

export interface StylePalette {
  name: string
  hex: string
}

export interface StyleTraitWeights {
  /** key 形如 face:鹅蛋脸 / skin:冷白 / goal:减龄 / scenario:通勤 / comfort:精致优先 / hairLen:中 / hairVol:多 */
  [key: string]: number
}

export interface Style {
  id: string
  name: string
  enName: string
  /** 一句话定位 */
  tagline: string
  /** 风格定义 */
  summary: string
  /** 视觉关键词 */
  keywords: string[]
  /** 细分风格 */
  subStyles: string[]
  /** 相邻风格 */
  adjacent: string[]
  /** 所属大类（用于筛选） */
  group: '甜美系' | '酷感系' | '优雅系' | '休闲系' | '个性系'
  /** 代表性配色 */
  palette: StylePalette[]
  /** 妆容特点 */
  makeup: string[]
  /** 发型、发色建议 */
  hair: { styles: string[]; colors: string[]; notes: string }
  /** 服装版型与搭配原则 */
  outfit: { silhouettes: string[]; rules: string[] }
  /** 鞋包和配饰建议 */
  accessories: string[]
  /** 适用场景 */
  scenarios: string[]
  /** 入门搭配方案（可执行） */
  starterLook: string[]
  /** 低预算替代方案 */
  budgetAlternatives: string[]
  /** 常见搭配误区 */
  mistakes: string[]
  /** 适合什么偏好的人 */
  suitedFor: string
  /** 哪些条件下需要调整 */
  adjustNotes: string
  /** 规则引擎权重 */
  traits: StyleTraitWeights
  image: ImageRef
}

/* ---------------- 时尚趋势 ---------------- */

/** 全球时尚趋势：源自品牌秀场 / 时装杂志 / 社交媒体风潮，提供审美参考 */
export interface Trend {
  id: string
  name: string
  enName: string
  /** 所属领域：穿搭 / 妆容 / 发型 */
  category: 'outfit' | 'makeup' | 'hair'
  /** 出处：品牌秀场、杂志报道、社交媒体风潮 */
  source: string
  /** 一句话定义 */
  summary: string
  /** 普通人如何日常化（可落地建议） */
  dailyTip: string
}

/* ---------------- 妆容 ---------------- */

export interface MakeupDesign {
  id: string
  name: string
  /** 妆容类型：日常/通勤/约会/甜美/辣妹/御姐/甜酷/清透/复古 */
  type: string
  mood: string
  description: string
  /** 关联的时尚趋势 id（可选） */
  trend?: string
  /** 该趋势在本方案中的体现与日常化要点 */
  trendNote?: string
  /** 底妆质感 */
  base: string
  brows: string
  eyes: string
  blush: string
  contour: string
  lips: string
  /** 适合的色彩范围 */
  colors: { name: string; hex: string }[]
  steps: string[]
  /** 新手难度 1-3 */
  difficulty: 1 | 2 | 3
  /** 预计耗时（分钟） */
  duration: number
  /** 可替换的产品类型或颜色（不指定品牌） */
  alternatives: string[]
  /** 适合肤色/人群 */
  suits: string
  /** 关联风格 id */
  styleIds: string[]
  image: ImageRef
}

/* ---------------- 发型 ---------------- */

export interface HairDesign {
  id: string
  name: string
  length: '短发' | '中长发' | '长发'
  /** 直发/卷发/层次等 */
  texture: string
  bangs: string
  /** 关联的时尚趋势 id（可选） */
  trend?: string
  /** 该趋势在本方案中的体现与日常化要点 */
  trendNote?: string
  /** 适配脸型（参考，非绝对） */
  faceShapes: string[]
  hairQuality: string[]
  hairVolume: string[]
  /** 日常打理时间（分钟） */
  careTime: number
  /** 打理难度 1-3 */
  careLevel: 1 | 2 | 3
  colors: string[]
  reasons: string[]
  limitations: string[]
  /** 到理发店可直接描述的需求 */
  salonBrief: string
  styleIds: string[]
  image: ImageRef
}

/* ---------------- 穿搭 ---------------- */

export interface OutfitDesign {
  id: string
  name: string
  scenario: string
  seasons: string[]
  budget: '低' | '中' | '高'
  styleIds: string[]
  /** 关联的时尚趋势 id（可选） */
  trend?: string
  /** 该趋势在本方案中的体现与日常化要点 */
  trendNote?: string
  /** 灵感来源：品牌 / 杂志 / 秀场 */
  inspiration?: string
  top: string
  bottom: string
  dress?: string
  outer: string
  shoes: string
  bag: string
  accessories: string[]
  palette: { name: string; hex: string }[]
  fit: string
  reason: string
  comfort: '高' | '中' | '低'
  exposure: '低' | '中' | '高'
  complexity: 1 | 2 | 3
  image: ImageRef
}

/* ---------------- 用户档案 ---------------- */

export interface PhotoRef {
  blob: Blob
  /** 拍摄于本机，仅存于本地 */
  note: string
  mime: string
}

export interface ProfileBodyInfo {
  build?: string
  shoulder?: string
  waist?: string
  hip?: string
  leg?: string
  /** 身材目标（偏好表达，不定义优劣） */
  goal?: string
}

export interface ProfileHairInfo {
  texture?: string
  volume?: string
  current?: string
  careTime?: number
}

export interface ImageProfile {
  id: string
  createdAt: string
  updatedAt: string
  /** 完成度：进行到第几步（0 起） */
  step: number
  completed: boolean
  facePhoto?: PhotoRef | null
  bodyPhoto?: PhotoRef | null
  /** 身高：数值（厘米）或大致范围 */
  height?: number | string | null
  body?: ProfileBodyInfo | null
  faceShape?: string | null
  faceFeatures: string[]
  skinTone?: string | null
  undertone?: string | null
  personalColors: string[]
  hair: ProfileHairInfo
  likedStyles: string[]
  dislikedStyles: string[]
  scenarios: string[]
  budget?: string | null
  comfort?: string | null
  goals: string[]
  selfDescription?: string
  /** 记录哪些信息被用户明确跳过 */
  skipped: string[]
}

/* ---------------- 推荐结果 ---------------- */

export interface RecommendedStyle {
  styleId: string
  score: number
  /** 推荐理由（与用户已知特征/偏好关联） */
  reasons: string[]
  /** 混合风格中的占比（%） */
  ratio: number
}

/** 妆容推荐（含执行细节；旧记录中细节字段可能缺失） */
export interface RecommendedMakeup {
  designId: string
  name: string
  why: string
  /** 推荐方案示意图（旧记录可能缺失） */
  image?: ImageRef
  base?: string
  brows?: string
  eyes?: string
  blush?: string
  contour?: string
  lips?: string
  colors?: { name: string; hex: string }[]
  steps?: string[]
  difficulty?: 1 | 2 | 3
  duration?: number
  alternatives?: string[]
  suits?: string
}

/** 发型推荐（含执行细节） */
export interface RecommendedHair {
  designId: string
  name: string
  why: string
  /** 推荐方案示意图（旧记录可能缺失） */
  image?: ImageRef
  length?: string
  texture?: string
  bangs?: string
  colors?: string[]
  careTime?: number
  careLevel?: 1 | 2 | 3
  reasons?: string[]
  limitations?: string[]
  /** 到理发店可直接描述的需求 */
  salonBrief?: string
}

/** 穿搭推荐（含完整单品清单） */
export interface RecommendedOutfit {
  designId: string
  name: string
  why: string
  /** 推荐方案示意图（旧记录可能缺失） */
  image?: ImageRef
  scenario?: string
  seasons?: string[]
  budget?: string
  top?: string
  bottom?: string
  dress?: string
  outer?: string
  shoes?: string
  bag?: string
  accessories?: string[]
  palette?: { name: string; hex: string }[]
  fit?: string
  reason?: string
  comfort?: string
  exposure?: string
  complexity?: 1 | 2 | 3
}

/** 场景 look：具体到单品的搭配组合 */
export interface SceneLook {
  scenario: string
  tip: string
  /** 该场景的可执行单品组合 */
  look?: string[]
}

/** 采购清单条目 */
export interface ShoppingItem {
  item: string
  priority: '高' | '中' | '低'
  note?: string
}

/** 分阶段改造计划 */
export interface PlanPhase {
  phase: string
  actions: string[]
}

export interface Recommendation {
  id: string
  profileId: string
  createdAt: string
  profileSnapshot: {
    faceShape?: string | null
    skinTone?: string | null
    undertone?: string | null
    likedStyles: string[]
    scenarios: string[]
    goals: string[]
    skipped: string[]
    height?: number | string | null
  }
  topStyles: RecommendedStyle[]
  mix: RecommendedStyle[]
  /** 综合解读：结合档案特征的一段整体说明 */
  summary?: string
  makeup: RecommendedMakeup[]
  hair: RecommendedHair[]
  outfits: RecommendedOutfit[]
  /** 不同生活场景的完整 look */
  sceneLooks: SceneLook[]
  /** 可执行的改造步骤 */
  steps: string[]
  /** 采购清单（按优先级） */
  shoppingList?: ShoppingItem[]
  /** 避坑提醒（来自主推风格的常见误区） */
  avoidMistakes?: string[]
  /** 分阶段改造计划 */
  plan?: PlanPhase[]
  /** 信息不足说明 */
  infoGaps: string[]
  /** 应用过的调整项 */
  appliedAdjustments: AdjustmentKey[]
}

/* ---------------- 收藏 ---------------- */

export type FavoriteType = 'style' | 'makeup' | 'hair' | 'outfit'

export interface Favorite {
  id: string
  type: FavoriteType
  refId: string
  name: string
  createdAt: string
}

/* ---------------- 调整项 ---------------- */

export type AdjustmentKey =
  | 'cute'
  | 'mature'
  | 'edgy'
  | 'daily'
  | 'minimal'
  | 'budget'
  | 'easyCare'
