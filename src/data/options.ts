/* ============================================================
 * 形象档案表单选项
 * 所有选项均为「自我描述」，与系统推断明确区分
 * ============================================================ */

export const FACE_SHAPES = [
  { id: '鹅蛋脸', desc: '额头与下颌宽度相近，线条柔和', hint: '公认的百搭脸型，多数风格都可驾驭' },
  { id: '圆脸', desc: '长宽相近，脸颊饱满，下颌线条柔和', hint: '可通过发型与领口制造纵向线条' },
  { id: '方脸', desc: '下颌角明显，颧骨与下颌宽度接近', hint: '用柔和的卷发与 V 领柔化线条' },
  { id: '长脸', desc: '脸长明显大于宽，额头或下巴较长', hint: '用刘海与横向元素平衡比例' },
  { id: '心形脸', desc: '额头较宽，下巴尖细', hint: '上宽下窄，适合露出额头与侧分' },
  { id: '菱形脸', desc: '颧骨最宽，额头与下颌较窄', hint: '用蓬松发根与刘海修饰颧骨' },
  { id: '梨形脸', desc: '下颌较宽，额头较窄', hint: '增加上半身量感平衡比例' },
] as const

export const FACE_FEATURES = [
  '大眼睛', '圆眼睛', '长眼睛', '内双', '单眼皮', '双眼皮',
  '高鼻梁', '鼻头圆润', '薄唇', '厚唇', '高颧骨', '苹果肌饱满',
  '下颌线条明显', '下巴圆润', '有酒窝', '皮肤有痘印/瑕疵',
] as const

export const SKIN_TONES = [
  { id: '冷白', desc: '偏粉调的浅肤色，戴银饰显白' },
  { id: '暖白', desc: '偏米调的浅肤色，戴金饰显白' },
  { id: '中性白', desc: '冷暖皆宜的浅肤色' },
  { id: '冷黄', desc: '偏橄榄调的中等肤色' },
  { id: '暖黄', desc: '偏金调的黄皮肤色' },
  { id: '健康小麦', desc: '偏棕调的小麦肤色' },
  { id: '深肤色', desc: '偏深棕调的健康肤色' },
] as const

export const UNDERTONES = [
  { id: '冷调', desc: '手腕血管偏蓝紫，银饰更衬肤色' },
  { id: '暖调', desc: '手腕血管偏绿，金饰更衬肤色' },
  { id: '中性调', desc: '金银皆可，很难判断' },
  { id: '不确定', desc: '还没仔细观察过' },
] as const

export const PERSONAL_COLORS = [
  '春季型（暖·浅：蜜桃、珊瑚、浅黄）',
  '夏季型（冷·浅：雾蓝、玫瑰粉、浅灰）',
  '秋季型（暖·深：驼色、橄榄绿、砖红）',
  '冬季型（冷·深：藏青、正红、黑）',
  '不确定',
] as const

export const HAIR_TEXTURES = ['细软', '适中', '粗硬', '不确定'] as const
export const HAIR_VOLUMES = ['偏少', '适中', '偏多'] as const
export const HAIR_CURRENT = [
  '黑长直', '染过色的直发', '卷发/烫发', '短发', '中长发', '锁骨发', '刘海', '不确定/随意',
] as const
export const CARE_TIMES = [0, 5, 10, 15, 20, 30, 45, 60] as const

export const SCENARIOS = [
  '日常通勤', '学生/校园', '约会', '朋友聚会', '商务正式', '旅行度假', '运动健身', '节日派对',
] as const

export const BUDGETS = [
  { id: '低', desc: '单件 100-300 元为主，注重性价比' },
  { id: '中', desc: '单件 300-800 元，愿意为核心单品投资' },
  { id: '高', desc: '单件 800 元以上，注重面料与设计' },
] as const

export const COMFORTS = [
  { id: '舒适优先', desc: '宽松自在最重要，颜值其次' },
  { id: '平衡', desc: '好看与舒服都要兼顾' },
  { id: '精致优先', desc: '为了造型效果可以接受一定不适' },
] as const

export const GOALS = [
  '显瘦', '显白', '减龄', '气场强', '亲和力', '高级感', '有个性', '利落干练',
] as const

/** 常见身材目标（不定义优劣，只表达个人偏好） */
export const BODY_GOALS = [
  { id: '突出曲线', desc: '希望强调身材曲线' },
  { id: '宽松舒适', desc: '喜欢宽松、不束缚的感觉' },
  { id: '强调利落', desc: '喜欢直线条、利落的剪裁' },
  { id: '显高显瘦', desc: '希望视觉上更修长' },
  { id: '舒服就好', desc: '没有特别的修饰需求' },
] as const

export const BODY_BUILDS = [
  { id: '匀称', desc: '整体比例均衡' },
  { id: '纤细', desc: '骨架偏小、身形偏瘦' },
  { id: '丰满', desc: '曲线明显、身形丰润' },
  { id: '高挑', desc: '身高较高、骨架偏大' },
  { id: '不确定', desc: '没怎么注意过' },
] as const

export const HEIGHT_OPTIONS = ['155 以下', '155-160', '161-165', '166-170', '171-175', '176 以上'] as const

/** 允许跳过（不收集）的敏感/可选信息 */
export const SKIPPABLE_KEYS = ['facePhoto', 'bodyPhoto', 'height', 'body', 'faceShape', 'skinTone', 'undertone', 'personalColors'] as const
