/* 全量扫描 src，把剩余的 assets/images/*.jpg|png 引用切换为 .webp */
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', 'src')
let files = 0
let hits = 0

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      walk(p)
    } else if (/\.(ts|tsx|css)$/.test(name)) {
      const src = fs.readFileSync(p, 'utf8')
      const m = src.match(/assets\/images\/[^'"\s]+\.(jpe?g|png)/g)
      if (!m || !m.length) continue
      const next = src.replace(/(assets\/images\/[^'"\s]+)\.(jpe?g|png)/g, '$1.webp')
      fs.writeFileSync(p, next, 'utf8')
      files++
      hits += m.length
      console.log(`${path.relative(SRC, p)}: ${m.length} 处`)
    }
  }
}

walk(SRC)
console.log(`\n共修改 ${files} 个文件, ${hits} 处引用`)
