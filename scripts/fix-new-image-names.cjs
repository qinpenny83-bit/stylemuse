/* 修正补图文件名：使其与数据文件中的 id 完全一致
 * 生成时按「前缀 + id」命名，但数据 import 用的是纯 id，这里对齐。
 */
const fs = require('fs')
const path = require('path')

const IMG_DIR = path.join(__dirname, '..', 'src', 'assets', 'images')
const DATA_DIR = path.join(__dirname, '..', 'src', 'data')
const FILES = ['hair.ts', 'makeup.ts', 'outfits.ts']

const all = fs.readdirSync(IMG_DIR)
let renamed = 0
const missing = []

for (const f of FILES) {
  const src = fs.readFileSync(path.join(DATA_DIR, f), 'utf8')
  const refs = [...src.matchAll(/from '\.\.\/assets\/images\/([^']+\.webp)'/g)].map((m) => m[1])
  for (const ref of new Set(refs)) {
    if (fs.existsSync(path.join(IMG_DIR, ref))) continue
    // 找 <prefix>-<ref> 形式的现有文件
    const cand = all.filter((n) => n.endsWith('-' + ref))
    if (cand.length === 0) {
      missing.push(`${f} -> ${ref}`)
      continue
    }
    fs.renameSync(path.join(IMG_DIR, cand[0]), path.join(IMG_DIR, ref))
    renamed++
    console.log(`  ${cand[0]}  =>  ${ref}`)
  }
}

console.log(`\n重命名: ${renamed}`)
if (missing.length) {
  console.log('仍未找到:')
  missing.forEach((m) => console.log('  ' + m))
}
