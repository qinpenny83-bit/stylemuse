/* 数据完整性体检：检查跨文件引用是否存在断链、缺图、重复 id */
const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '..', 'src', 'data')
const read = (f) => fs.readFileSync(path.join(base, f), 'utf8')

const ids = (text) => [...text.matchAll(/^    id: '([^']+)',$/gm)].map((m) => m[1])
const all = (re, text) => [...text.matchAll(re)].map((m) => m[1])

const trendText = read('trends.ts')
const trendIds = new Set(all(/^    id: '([^']+)',$/gm, trendText))

const styleText = ['styles1.ts', 'styles2.ts', 'styles3.ts'].map(read).join('\n')
const styleIds = new Set(all(/^    id: '([^']+)',$/gm, styleText))

const report = []

for (const f of ['hair.ts', 'makeup.ts', 'outfits.ts']) {
  const text = read(f)
  const items = ids(text)
  const dup = items.filter((v, i) => items.indexOf(v) !== i)

  // 每个块内是否引用了 trend / styleIds，引用值是否存在
  const badTrend = []
  const badStyle = []
  const imgTotal = (text.match(/aiImg\(/g) || []).length
  const imgLocal = (text.match(/^\s+src: /gm) || []).length

  const blocks = text.split(/\n  \{\n/)
  for (const b of blocks) {
    const tid = (b.match(/^\s+trend: '([^']*)'/m) || [])[1]
    if (tid && tid !== '' && !trendIds.has(tid)) badTrend.push(tid)
    const sids = (b.match(/styleIds: \[([^\]]*)\]/) || [])[1]
    if (sids) {
      for (const s of sids.split(',').map((x) => x.trim().replace(/^'|'$/g, '')).filter(Boolean)) {
        if (!styleIds.has(s)) badStyle.push(s)
      }
    }
  }

  report.push({
    file: f,
    items: items.length,
    duplicateIds: [...new Set(dup)],
    images: `${imgLocal}/${imgTotal}`,
    missingImages: imgTotal - imgLocal,
    brokenTrendRefs: [...new Set(badTrend)].slice(0, 12),
    brokenStyleRefs: [...new Set(badStyle)].slice(0, 12),
  })
}

console.log('== 趋势条目数:', trendIds.size, ' 风格条目数:', styleIds.size)
for (const r of report) {
  console.log(`\n-- ${r.file}`)
  console.log(`   条目数=${r.items} 本地图片=${r.images} 缺图=${r.missingImages}`)
  if (r.duplicateIds.length) console.log('   ⚠ 重复id:', r.duplicateIds.join(', '))
  if (r.brokenTrendRefs.length) console.log('   ⚠ 断链trend:', r.brokenTrendRefs.join(', '))
  else console.log('   ✓ trend 引用完好')
  if (r.brokenStyleRefs.length) console.log('   ⚠ 断链style:', r.brokenStyleRefs.join(', '))
  else console.log('   ✓ styleIds 引用完好')
}

// 反向：哪些风格没有被任何方案引用
const used = new Set()
for (const f of ['hair.ts', 'makeup.ts', 'outfits.ts']) {
  const text = read(f)
  for (const m of text.matchAll(/styleIds: \[([^\]]*)\]/g)) {
    for (const s of m[1].split(',').map((x) => x.trim().replace(/^'|'$/g, '')).filter(Boolean)) used.add(s)
  }
}
const orphan = [...styleIds].filter((s) => !used.has(s))
console.log('\n== 未被任何方案引用的风格:', orphan.length ? orphan.join(', ') : '无')
