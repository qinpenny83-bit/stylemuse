/* ============================================================
 * 新手风格测验：10 题快问快答，输出主风格 + 混搭方向
 * 每题选项带风格权重，累计得分取前三
 * ============================================================ */

export interface QuizOption {
  label: string
  hint?: string
  /** 颜色题显示的色卡 */
  swatch?: string[]
  /** 风格权重：styleId -> 分值 */
  weights: Record<string, number>
}

export interface QuizQuestion {
  id: string
  title: string
  options: QuizOption[]
}

export interface QuizScore {
  styleId: string
  score: number
}

export interface QuizResult {
  top: QuizScore
  second: QuizScore
  third: QuizScore
}

const W3 = { 'japanese-sweet': 3, 'korean-sweet': 3, 'ballet-core': 2, 'preppy-girl': 2 }
const W3B = { 'minimal-lux': 3, 'cool-lady': 3, 'androgynous': 2, 'smart-casual': 2 }
const W3C = { 'french-lazy': 3, 'vintage-hk': 2, 'literary-chic': 2, 'gentle-lady': 3 }
const W3D = { 'y2k': 3, 'street-sweet': 2, 'western-hot': 2, 'gothic-dark': 2 }

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'scenario',
    title: '你平时最常为什么场合打扮？',
    options: [
      { label: '通勤 / 上课', hint: '一周里穿得最多的就是它', weights: { 'smart-casual': 3, 'minimal-lux': 2, 'gentle-lady': 2, 'elegant-socialite': 1 } },
      { label: '日常出门 / 逛街', hint: '怎么舒服怎么来，但要好看', weights: { 'sporty-leisure': 3, 'french-lazy': 2, 'street-sweet': 2, 'korean-sweet': 2 } },
      { label: '约会 / 聚会', hint: '想认真穿出彩的场合', weights: { 'pure-desire': 3, 'elegant-socialite': 2, 'western-hot': 2, 'ballet-core': 2 } },
      { label: '都在穿，看心情', hint: '不局限于某一种场合', weights: { 'y2k': 2, 'street-sweet': 2, 'vintage-hk': 2, 'androgynous': 2 } },
    ],
  },
  {
    id: 'color',
    title: '第一眼就喜欢的颜色组合是？',
    options: [
      { label: '奶油粉彩', hint: '粉、米、杏色系', swatch: ['#f7c8d4', '#f5e6d3', '#efe4d2'], weights: W3 },
      { label: '黑白灰', hint: '极简不出错', swatch: ['#222', '#888', '#eee'], weights: W3B },
      { label: '大地色复古', hint: '棕、卡其、酒红', swatch: ['#8a6a4b', '#c9a86a', '#7a3b3b'], weights: W3C },
      { label: '高饱和撞色', hint: '亮红、荧光绿、电光紫', swatch: ['#e0394b', '#b5e22d', '#8b5cf6'], weights: W3D },
    ],
  },
  {
    id: 'silhouette',
    title: '哪种版型穿在你身上最自在？',
    options: [
      { label: '宽松舒适', hint: '不勒不贴，活动自由', weights: { 'sporty-leisure': 3, 'french-lazy': 2, 'outdoor-mountain': 2, 'y2k': 2 } },
      { label: '修身显线条', hint: '喜欢衣服贴着身形', weights: { 'western-hot': 3, 'pure-desire': 2, 'elegant-socialite': 2, 'dark-cool': 2 } },
      { label: '合身得体', hint: '不大不小，干净利落', weights: { 'smart-casual': 3, 'gentle-lady': 2, 'preppy-girl': 2, 'new-chinese': 2 } },
      { label: '混搭不设限', hint: '什么版型都想试', weights: { 'street-sweet': 3, 'androgynous': 2, 'gothic-dark': 2, 'y2k': 2 } },
    ],
  },
  {
    id: 'aura',
    title: '朋友眼中的你更接近？',
    options: [
      { label: '甜美有亲和力', weights: { 'japanese-sweet': 3, 'korean-sweet': 3, 'ballet-core': 2, 'preppy-girl': 2 } },
      { label: '酷帅有气场', weights: { 'dark-cool': 3, 'androgynous': 3, 'gothic-dark': 2, 'western-hot': 2 } },
      { label: '优雅知性', weights: { 'gentle-lady': 3, 'elegant-socialite': 2, 'minimal-lux': 2, 'literary-chic': 2 } },
      { label: '随性自然', weights: { 'french-lazy': 3, 'sporty-leisure': 2, 'outdoor-mountain': 2, 'literary-chic': 2 } },
    ],
  },
  {
    id: 'motivation',
    title: '穿衣服对你来说最重要的是？',
    options: [
      { label: '被人注意到', hint: '出场就要有记忆点', weights: { 'y2k': 3, 'western-hot': 2, 'gothic-dark': 2, 'elegant-socialite': 2 } },
      { label: '舒服自在第一', weights: { 'sporty-leisure': 3, 'french-lazy': 3, 'outdoor-mountain': 2 } },
      { label: '精致得体', hint: '得体比出挑更重要', weights: { 'elegant-socialite': 3, 'smart-casual': 2, 'minimal-lux': 2, 'gentle-lady': 2 } },
      { label: '表达我自己', hint: '衣服是我的语言', weights: { 'androgynous': 3, 'gothic-dark': 2, 'y2k': 2, 'street-sweet': 2 } },
    ],
  },
  {
    id: 'makeup',
    title: '你对妆容的态度是？',
    options: [
      { label: '淡妆或不画', hint: '越自然越好', weights: { 'french-lazy': 3, 'korean-sweet': 2, 'sporty-leisure': 2, 'japanese-sweet': 2 } },
      { label: '精致完整妆', hint: '眼唇底妆都要到位', weights: { 'elegant-socialite': 3, 'western-hot': 2, 'pure-desire': 2 } },
      { label: '大胆尝试', hint: '新配色、新画法都敢试', weights: { 'y2k': 3, 'gothic-dark': 2, 'dark-cool': 2, 'western-hot': 2 } },
      { label: '看场合调整', weights: { 'smart-casual': 2, 'gentle-lady': 2, 'new-chinese': 2, 'cool-lady': 2 } },
    ],
  },
  {
    id: 'hair',
    title: '理想中的头发是？',
    options: [
      { label: '长发温柔', hint: '及肩到腰的长发', weights: { 'gentle-lady': 3, 'pure-desire': 2, 'ballet-core': 2, 'literary-chic': 2 } },
      { label: '短发利落', hint: '清爽好打理', weights: { 'cool-lady': 3, 'androgynous': 2, 'smart-casual': 2 } },
      { label: '中长微卷', hint: '慵懒有空气感', weights: { 'french-lazy': 3, 'korean-sweet': 2, 'new-chinese': 2, 'vintage-hk': 2 } },
      { label: '随心情换', hint: '长短造型都想尝试', weights: { 'street-sweet': 3, 'y2k': 2, 'dark-cool': 2, 'gothic-dark': 2 } },
    ],
  },
  {
    id: 'shoebag',
    title: '鞋和包，你更偏好哪种？',
    options: [
      { label: '高跟鞋 + 精致包', weights: { 'elegant-socialite': 3, 'pure-desire': 2, 'western-hot': 2, 'ballet-core': 2 } },
      { label: '运动鞋 / 帆布包', hint: '轻便实用', weights: { 'sporty-leisure': 3, 'japanese-sweet': 2, 'street-sweet': 2, 'outdoor-mountain': 2 } },
      { label: '靴子 + 大容量包', hint: '有个性也能装', weights: { 'dark-cool': 3, 'gothic-dark': 2, 'androgynous': 2, 'western-hot': 2 } },
      { label: '基础款为主', hint: '百搭耐看', weights: { 'minimal-lux': 3, 'smart-casual': 2, 'cool-lady': 2, 'french-lazy': 2 } },
    ],
  },
  {
    id: 'layering',
    title: '换季时你最爱怎么穿？',
    options: [
      { label: '叠穿有层次', hint: '外套、针织、围巾层层搭', weights: { 'french-lazy': 3, 'vintage-hk': 2, 'literary-chic': 2, 'new-chinese': 2 } },
      { label: '一件搞定', hint: '简单省事', weights: { 'minimal-lux': 3, 'smart-casual': 2, 'sporty-leisure': 2 } },
      { label: '修身露肤', hint: '线条感优先', weights: { 'pure-desire': 3, 'western-hot': 2, 'elegant-socialite': 2, 'y2k': 2 } },
      { label: '靠配饰出彩', hint: '帽子、包、首饰点睛', weights: { 'street-sweet': 3, 'y2k': 2, 'gothic-dark': 2, 'ballet-core': 2 } },
    ],
  },
  {
    id: 'praise',
    title: '别人最常夸你什么？',
    options: [
      { label: '可爱、有亲和力', weights: { 'japanese-sweet': 3, 'korean-sweet': 3, 'ballet-core': 2, 'preppy-girl': 2 } },
      { label: '气质好、精致', weights: { 'gentle-lady': 3, 'elegant-socialite': 2, 'minimal-lux': 2, 'literary-chic': 2 } },
      { label: '很酷、有个性', weights: { 'dark-cool': 3, 'androgynous': 3, 'gothic-dark': 2, 'y2k': 2 } },
      { label: '舒服、好相处', weights: { 'french-lazy': 3, 'sporty-leisure': 2, 'outdoor-mountain': 2, 'smart-casual': 2 } },
    ],
  },
]

/** 累计 10 题答案（每题所选选项序号），返回得分前三 */
export function runQuiz(answers: number[]): QuizResult {
  const scores = new Map<string, number>()
  QUIZ_QUESTIONS.forEach((q, qi) => {
    const pick = answers[qi]
    if (pick === undefined) return
    const option = q.options[pick]
    if (!option) return
    for (const [styleId, w] of Object.entries(option.weights)) {
      scores.set(styleId, (scores.get(styleId) ?? 0) + w)
    }
  })
  const list: QuizScore[] = [...scores.entries()].map(([styleId, score]) => ({ styleId, score }))
  list.sort((a, b) => b.score - a.score)
  return {
    top: list[0] ?? { styleId: 'japanese-sweet', score: 0 },
    second: list[1] ?? { styleId: 'french-lazy', score: 0 },
    third: list[2] ?? { styleId: 'minimal-lux', score: 0 },
  }
}
