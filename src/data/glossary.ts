/* ============================================================
 * 时尚词典：趋势词 / 单品词 / 妆容词
 * 供新手学堂与站内生僻词内联解释复用
 * ============================================================ */

export type GlossaryCategory = 'trend' | 'item' | 'makeup'

export interface GlossaryEntry {
  term: string
  en: string
  category: GlossaryCategory
  /** 一句话通俗解释 */
  def: string
  /** 站内关联页面（可选） */
  link?: string
}

export const GLOSSARY: GlossaryEntry[] = [
  /* -------- 趋势词 -------- */
  { term: 'Y2K', en: 'Y2K / Year 2000', category: 'trend', def: '2000 年前后的未来感穿搭复兴：金属色、低腰、透明材质，大胆又复古。', link: '/trends' },
  { term: '静奢风', en: 'Quiet Luxury', category: 'trend', def: '不露 logo 的高级感，靠面料质感和剪裁说话，低调但贵气。', link: '/trends' },
  { term: '老钱风', en: 'Old Money Aesthetic', category: 'trend', def: '像世家大族一样低调讲究的穿法：经典单品、克制配色、耐看大方。', link: '/trends' },
  { term: '清透感', en: 'Clean Girl', category: 'trend', def: '干净透亮的妆容和穿搭，重点是"皮肤好、状态好"，不做多余装饰。', link: '/trends' },
  { term: '蝴蝶结少女风', en: 'Coquette', category: 'trend', def: '用蝴蝶结、蕾丝、缎面堆出甜美又有点娇俏的少女氛围。', link: '/trends' },
  { term: '山系户外风', en: 'Gorpcore', category: 'trend', def: '把冲锋衣、登山鞋、户外机能单品穿进日常，实用又时髦。', link: '/trends' },
  { term: '芭蕾风', en: 'Balletcore', category: 'trend', def: '把芭蕾平底鞋、纱裙、丝带这些芭蕾元素穿进日常生活。', link: '/trends' },
  { term: '新中式', en: 'New Chinese Style', category: 'trend', def: '盘扣、立领、刺绣等中式元素与现代版型结合，古典又日常。', link: '/trends' },
  { term: '废土风', en: 'Wasteland Style', category: 'trend', def: '末日感做旧质感：褶皱、做旧、机能细节，层层叠叠的酷。', link: '/trends' },
  { term: '多巴胺穿搭', en: 'Dopamine Dressing', category: 'trend', def: '用高饱和亮色给自己"充电"的快乐穿搭，穿完心情都会变好。', link: '/trends' },
  { term: '美拉德风', en: 'Maillard Style', category: 'trend', def: '以牛排焦褐色的棕系为主色，秋冬最出片的温暖色系。', link: '/trends' },
  { term: '格雷系', en: 'Grey Aesthetic', category: 'trend', def: '全身灰色系的冷淡极简穿法，安静、理性、不费力。', link: '/trends' },
  { term: '知识分子风', en: 'Intellectual Style', category: 'trend', def: '衬衫、针织、半框眼镜带出的书卷气，文艺又耐看。', link: '/trends' },
  { term: '极繁主义', en: 'Maximalism', category: 'trend', def: '大胆堆叠色彩、图案和配饰，越多越精彩，拒绝低调。', link: '/trends' },
  { term: '雕塑感西装', en: 'Sculptural Suit', category: 'trend', def: '肩线利落、廓形像雕塑一样立挺的西装，气场全开。', link: '/trends' },
  { term: '燕尾服日装化', en: 'Daytime Tailoring', category: 'trend', def: '把正式西装穿进白天日常：配 T 恤、运动鞋，正式感降级。', link: '/trends' },
  { term: '金属箔感', en: 'Metallic Foil', category: 'trend', def: '金属光泽面料做的点缀或整身穿搭，未来感拉满。', link: '/trends' },
  { term: '樱桃可乐妆', en: 'Cherry Cola Makeup', category: 'trend', def: '深樱桃红的唇、颊、眼妆，像可乐色一样复古又显白。', link: '/trends' },
  { term: '柔和烟熏眼', en: 'Soft Smoky Eyes', category: 'trend', def: '晕染柔和、边界模糊的烟熏眼影，深邃但不凶。', link: '/trends' },
  { term: '微细内眼线', en: 'Fine Eyeliner', category: 'trend', def: '画在睫毛根部内侧的极细眼线，自然放大双眼。', link: '/trends' },
  { term: '晒伤妆', en: 'Sunburnt Blush', category: 'trend', def: '腮红打在颧骨上方像被晒过一样，元气又度假感。', link: '/trends' },
  { term: '欧美立体修容', en: 'Euro Contour', category: 'trend', def: '高对比度的立体修容，轮廓分明，上镜感强。', link: '/trends' },
  { term: '披风与斗篷', en: 'Cape & Cloak', category: 'trend', def: '像大衣一样的披风式外套，走路带风，戏剧感十足。', link: '/trends' },

  /* -------- 单品词 -------- */
  { term: '胶囊衣橱', en: 'Capsule Wardrobe', category: 'item', def: '用少量百搭基础款（约 10 件）搭出大量组合的极简衣橱。', link: '/wardrobe' },
  { term: '廓形西装', en: 'Oversized Blazer', category: 'item', def: '肩线宽松、版型立挺的西装外套，通勤和休闲都能穿。', link: '/outfits' },
  { term: '百褶裙', en: 'Pleated Skirt', category: 'item', def: '布满细褶的裙子，走动时有律动感，学院风标配。', link: '/outfits' },
  { term: '阔腿裤', en: 'Wide-leg Pants', category: 'item', def: '裤腿宽松垂坠的长裤，遮肉显腿长，走路带风。', link: '/outfits' },
  { term: 'A字裙', en: 'A-line Skirt', category: 'item', def: '上窄下宽的伞状裙型，对身材包容度很高。', link: '/outfits' },
  { term: '直筒牛仔裤', en: 'Straight Jeans', category: 'item', def: '裤腿上下同宽的牛仔裤，不挑腿型，最百搭的单品之一。', link: '/outfits' },
  { term: '风衣', en: 'Trench Coat', category: 'item', def: '经典长款大衣，春秋通勤利器，怎么搭都好看。', link: '/outfits' },
  { term: '乐福鞋', en: 'Loafers', category: 'item', def: '没有鞋带的平底皮鞋，一脚蹬，通勤休闲两相宜。', link: '/outfits' },
  { term: '玛丽珍鞋', en: 'Mary Janes', category: 'item', def: '带搭扣的平底鞋，复古甜美，配裙子绝配。', link: '/outfits' },
  { term: '穆勒鞋', en: 'Mules', category: 'item', def: '后跟敞开的一脚蹬鞋，好穿脱，慵懒感十足。', link: '/outfits' },
  { term: '腋下包', en: 'Shoulder Bag', category: 'item', def: '短肩带小包，夹在腋下，利落又时髦。', link: '/outfits' },
  { term: '托特包', en: 'Tote Bag', category: 'item', def: '大容量手提袋，通勤装电脑、装书都靠它。', link: '/outfits' },
  { term: '针织开衫', en: 'Cardigan', category: 'item', def: '开襟的针织衫，叠穿、单穿都是万金油。', link: '/outfits' },
  { term: '打底衫', en: 'Base Layer', category: 'item', def: '贴身的基础内搭，秋冬叠穿第一层。', link: '/outfits' },
  { term: '尖头高跟鞋', en: 'Pointed Heels', category: 'item', def: '鞋头尖尖的高跟鞋，能拉长腿部线条。', link: '/outfits' },
  { term: '短靴', en: 'Ankle Boots', category: 'item', def: '到脚踝高度的靴子，秋冬配裤子裙子都利落。', link: '/outfits' },
  { term: '小白鞋', en: 'White Sneakers', category: 'item', def: '白色运动鞋，和任何衣服都能搭的万能单品。', link: '/outfits' },
  { term: '西装裤', en: 'Tailored Trousers', category: 'item', def: '垂坠有型的长裤，比牛仔裤正式，比西裤休闲。', link: '/outfits' },

  /* -------- 妆容词 -------- */
  { term: '修容', en: 'Contour', category: 'makeup', def: '用比肤色深的阴影色修饰轮廓，让脸更立体。', link: '/makeup' },
  { term: '腮红膏', en: 'Cream Blush', category: 'makeup', def: '膏状腮红，用手指或海绵拍开，妆效贴肤自然。', link: '/makeup' },
  { term: '高光', en: 'Highlighter', category: 'makeup', def: '提亮鼻梁、颧骨等部位的光泽粉，增加立体感。', link: '/makeup' },
  { term: '卧蚕', en: 'Under-eye Glow', category: 'makeup', def: '眼下卧蚕区提亮，让眼睛更有神、笑起来更甜。', link: '/makeup' },
  { term: '粉底液', en: 'Foundation', category: 'makeup', def: '均匀肤色的底妆产品，是底妆的"地基"。', link: '/makeup' },
  { term: '定妆', en: 'Setting Powder', category: 'makeup', def: '上完底妆后压一层粉，让妆更持久不脱。', link: '/makeup' },
  { term: '妆前乳', en: 'Primer', category: 'makeup', def: '上粉底之前打底的产品，让底妆更服帖持久。', link: '/makeup' },
  { term: '唇釉', en: 'Lip Gloss', category: 'makeup', def: '液体唇彩，光泽感强，颜色饱和。', link: '/makeup' },
  { term: '内眼线', en: 'Tightline', category: 'makeup', def: '画在睫毛根部内侧的眼线，自然放大双眼不突兀。', link: '/makeup' },
  { term: '睫毛膏', en: 'Mascara', category: 'makeup', def: '把睫毛刷长刷浓的产品，眼睛立刻有神。', link: '/makeup' },
  { term: '大地色眼影', en: 'Neutral Eyeshadow', category: 'makeup', def: '棕调基础眼影，最不挑人、新手最好上手的色系。', link: '/makeup' },
  { term: '粉调眼影', en: 'Pink Eyeshadow', category: 'makeup', def: '粉色系眼影，甜美妆感的灵魂色。', link: '/makeup' },
]

const map = new Map<string, GlossaryEntry>()
for (const g of GLOSSARY) {
  map.set(g.term, g)
  map.set(g.en.toLowerCase(), g)
}

/** 按中文名或英文名查找 */
export function getGlossary(key: string): GlossaryEntry | undefined {
  return map.get(key) ?? map.get(key.toLowerCase())
}
