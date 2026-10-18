/* 批量压缩项目图片：长边限制 + 转 WebP
 * 用法: node scripts/compress-images.cjs [长边像素] [质量]
 */
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const MAX_EDGE = Number(process.argv[2] || 800)
const QUALITY = Number(process.argv[3] || 78)

const dir = path.join(__dirname, '..', 'src', 'assets', 'images')
const files = fs
  .readdirSync(dir)
  .filter((f) => /\.(jpe?g|png)$/i.test(f))
  .sort()

let before = 0
let after = 0
const rows = []

;(async () => {
  for (const f of files) {
    const src = path.join(dir, f)
    const base = f.replace(/\.(jpe?g|png)$/i, '')
    const dst = path.join(dir, base + '.webp')
    before += fs.statSync(src).size
    await sharp(src)
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(dst)
    const s = fs.statSync(dst).size
    after += s
    rows.push({ base, from: fs.statSync(src).size, to: s })
  }

  console.log(`处理图片: ${files.length} 张`)
  console.log(`压缩前: ${(before / 1024 / 1024).toFixed(1)} MB`)
  console.log(`压缩后: ${(after / 1024 / 1024).toFixed(1)} MB`)
  console.log(`缩减: ${(100 - (after / before) * 100).toFixed(1)}%`)
  console.log(`平均单张: ${(after / files.length / 1024).toFixed(0)} KB`)
  console.log('')
  console.log('体积最大的 10 张（压缩后）:')
  rows
    .sort((a, b) => b.to - a.to)
    .slice(0, 10)
    .forEach((r) => console.log(`  ${(r.to / 1024).toFixed(0).padStart(5)} KB  ${r.base}  (原 ${(r.from / 1024).toFixed(0)} KB)`))
})()
