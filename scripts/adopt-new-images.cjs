// 把 _newimg/<id>/ 下生成的图片归档为 src/assets/images/<id>.png
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const newDir = path.join(root, '_newimg')
const outDir = path.join(root, 'src', 'assets', 'images')

let ok = 0
const fail = []

for (const id of fs.readdirSync(newDir)) {
  const d = path.join(newDir, id)
  if (!fs.statSync(d).isDirectory()) continue
  const files = fs.readdirSync(d).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
  if (files.length === 0) {
    fail.push(`${id}: 无图片`)
    continue
  }
  files.sort()
  const src = path.join(d, files[0])
  const dst = path.join(outDir, `${id}.png`)
  fs.copyFileSync(src, dst)
  ok++
}

console.log(`归档成功: ${ok}`)
if (fail.length) {
  console.log('失败:')
  fail.forEach((f) => console.log('  ' + f))
}
