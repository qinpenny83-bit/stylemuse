const fs = require('fs')
const path = require('path')

// 简易提取：用正则把数据文件里的方案对象转成 JS 可读结构
function parseFile(file) {
  const text = fs.readFileSync(file, 'utf8')
  const blocks = []
  const idRe = /^    id: '([^']+)',$/gm
  let m, lastId = null, lastIndex = 0
  while ((m = idRe.exec(text)) !== null) {
    if (lastId) blocks.push({ id: lastId, start: lastIndex, end: m.index })
    lastId = m[1]; lastIndex = m.index
  }
  if (lastId) blocks.push({ id: lastId, start: lastIndex, end: text.length })
  const out = []
  for (const b of blocks) {
    const block = text.slice(b.start, b.end)
    const g = (re) => { const x = block.match(re); return x ? x[1] : undefined }
    const ga = (re) => { const x = block.match(re); return x ? x[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean) : [] }
    out.push({
      id: b.id,
      scenario: g(/scenario: '([^']*)'/),
      seasons: ga(/seasons: \[([^\]]*)\]/),
      budget: g(/budget: '([^']*)'/),
      styleIds: ga(/styleIds: \[([^\]]*)\]/),
      trend: g(/trend: '([^']*)'/),
      type: g(/type: '([^']*)'/),
      difficulty: g(/difficulty: (\d)/),
      length: g(/length: '([^']*)'/),
      texture: g(/texture: '([^']*)'/),
      bangs: g(/bangs: '([^']*)'/),
      faceShapes: ga(/faceShapes: \[([^\]]*)\]/),
      colors: ga(/colors: \[([^\]]*)\]/),
      careLevel: g(/careLevel: (\d)/),
    })
  }
  return out
}

const stylesText = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'styles.ts'), 'utf8')
const styleNames = [...stylesText.matchAll(/name: '([^']*)'/g)].map(x => x[1])

const base = path.join(__dirname, '..', 'src', 'data')
const outfits = parseFile(path.join(base, 'outfits.ts'))
const makeups = parseFile(path.join(base, 'makeup.ts'))
const hairs = parseFile(path.join(base, 'hair.ts'))

console.log('==== 穿搭 (' + outfits.length + ') ====')
const scenSet = [...new Set(outfits.map(o => o.scenario))]
console.log('场景:', scenSet.join(' / '))
for (const s of scenSet) {
  const cnt = outfits.filter(o => o.scenario === s).length
  const seasons = {}
  for (const se of ['春','夏','秋','冬']) seasons[se] = outfits.filter(o => o.scenario === s && o.seasons.includes(se)).length
  const budgets = {}
  for (const b of ['低','中','高']) budgets[b] = outfits.filter(o => o.scenario === s && o.budget === b).length
  console.log(`  ${s}(${cnt}) 季节[${['春','夏','秋','冬'].map(se=>se+':'+seasons[se]).join(' ')}] 预算[${['低','中','高'].map(bb=>bb+':'+budgets[bb]).join(' ')}]`)
}
// 风格用 id 统计：styles.ts 提取 id:name
const styleIdName = [...stylesText.matchAll(/([\w-]+): \{[\s\S]*?name: '([^']*)'/g)].map(x => ({ id: x[1], name: x[2] }))
if (!styleIdName.length) {
  const ids = [...stylesText.matchAll(/id: '([^']*)'/g)].map(x => x[1])
  const names = [...stylesText.matchAll(/name: '([^']*)'/g)].map(x => x[1])
  for (let i = 0; i < Math.min(ids.length, names.length); i++) styleIdName.push({ id: ids[i], name: names[i] })
}
console.log('风格(穿搭):')
for (const s of styleIdName) {
  const c = outfits.filter(o => o.styleIds.includes(s.id)).length
  console.log(`  ${s.name}(${s.id}): ${c}`)
}

console.log('\n==== 妆容 (' + makeups.length + ') ====')
const typeSet = [...new Set(makeups.map(m => m.type))]
console.log('类型:', typeSet.join(' / '))
for (const t of typeSet) {
  const cnt = makeups.filter(m => m.type === t).length
  const diffs = {}
  for (const d of [1,2,3]) diffs[d] = makeups.filter(m => m.type === t && Number(m.difficulty) === d).length
  console.log(`  ${t}(${cnt}) 难度[${[1,2,3].map(d=>d+':'+diffs[d]).join(' ')}]`)
}

console.log('\n==== 发型 (' + hairs.length + ') ====')
const lenSet = ['短发','中长发','长发']
const texSet = ['直发','卷发','层次']
for (const l of lenSet) {
  for (const t of texSet) {
    const c = hairs.filter(h => h.length === l && h.texture && h.texture.includes(t)).length
    if (c) console.log(`  ${l}×${t}: ${c}`)
  }
}
console.log('发型长度分布:')
for (const l of lenSet) console.log(`  ${l}: ${hairs.filter(h=>h.length===l).length}`)
console.log('纹理分布:')
for (const t of texSet) console.log(`  ${t}: ${hairs.filter(h=>h.texture&&h.texture.includes(t)).length}`)
console.log('发色分布(前12):')
const colorCnt = {}
for (const h of hairs) for (const c of h.colors) colorCnt[c] = (colorCnt[c] || 0) + 1
Object.entries(colorCnt).sort((a,b)=>b[1]-a[1]).slice(0,12).forEach(([c,n]) => console.log(`  ${c}: ${n}`))
