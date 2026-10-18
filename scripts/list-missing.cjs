// 列出所有缺本地图片的条目：id / 名称 / aiImg 描述，供补图使用
const fs = require('fs')
const path = require('path')

const files = ['hair.ts', 'makeup.ts', 'outfits.ts']
const out = []

for (const f of files) {
  const p = path.join(__dirname, '..', 'src', 'data', f)
  const src = fs.readFileSync(p, 'utf8')
  const blocks = src.split(/\r?\n  \{\r?\n/)
  for (const b of blocks) {
    const imgAt = b.indexOf('image: {')
    if (imgAt < 0) continue
    const imgBlock = b.slice(imgAt)
    if (/src:/.test(imgBlock)) continue // 已有本地图
    const id = (b.match(/id:\s*'([^']+)'/) || [])[1]
    const name = (b.match(/name:\s*'([^']+)'/) || [])[1]
    const prompt = (imgBlock.match(/aiImg\(\s*\r?\n?\s*'([^']+)'/) || [])[1]
    if (!id) continue
    out.push({ file: f.replace('.ts', ''), id, name, prompt })
  }
}

console.log('缺图条目总数: ' + out.length)
console.log('')
out.forEach((o, i) => {
  console.log(`${i + 1}. [${o.file}] ${o.id} | ${o.name || '-'}`)
  console.log(`   prompt: ${o.prompt || '(未取到)'}`)
})
