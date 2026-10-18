/* 数据文件改造：
 * 1) 所有 assets/images/*.jpg|png 引用切换为 .webp
 * 2) 为缺本地图的条目回填 src（补图）
 */
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'src', 'data')
const FILES = ['hair.ts', 'makeup.ts', 'outfits.ts']

function toVarName(id) {
  const camel = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
  const safe = camel.replace(/[^A-Za-z0-9_$]/g, '')
  // 首字母若为数字则前缀 _
  return (/^[0-9]/.test(safe) ? '_' : '') + safe
}

for (const f of FILES) {
  const p = path.join(DATA_DIR, f)
  let src = fs.readFileSync(p, 'utf8')
  const EOL = src.includes('\r\n') ? '\r\n' : '\n'

  // ---- 1) 扩展名切换 ----
  const beforeExt = (src.match(/assets\/images\/[^'"]+\.(jpe?g|png)/g) || []).length
  src = src.replace(/(assets\/images\/[^'"]+)\.(jpe?g|png)/g, '$1.webp')

  // ---- 2) 找缺图条目 ----
  const blocks = src.split(/\r?\n  \{\r?\n/)
  const added = []
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    const imgAt = b.indexOf('image: {')
    if (imgAt < 0) continue
    if (/src:/.test(b.slice(imgAt))) continue
    const id = (b.match(/id:\s*'([^']+)'/) || [])[1]
    if (!id) continue
    const varName = toVarName(id) + 'Img'
    // 在 image 对象闭合 "    }," 前插入 src
    const closeIdx = b.indexOf('\n    },' + EOL, imgAt)
    if (closeIdx < 0) {
      // 兼容 LF 结尾
      const alt = b.indexOf('\n    },', imgAt)
      if (alt < 0) continue
      blocks[i] = b.slice(0, alt) + EOL + '      src: ' + varName + ',' + b.slice(alt)
    } else {
      blocks[i] = b.slice(0, closeIdx) + EOL + '      src: ' + varName + ',' + b.slice(closeIdx)
    }
    added.push({ id, varName })
  }
  src = blocks.join('\n  {' + EOL)

  // ---- 3) 插入 import ----
  if (added.length) {
    const imports = added
      .map((a) => `import ${a.varName} from '../assets/images/${a.id}.webp'`)
      .join(EOL)
    const marker = src.indexOf('\nexport const')
    if (marker >= 0) {
      src = src.slice(0, marker) + EOL + EOL + '// 补图：原先走远程生成接口的条目，已落地为本地图' + EOL + imports + src.slice(marker)
    }
  }

  fs.writeFileSync(p, src, 'utf8')
  console.log(`${f}: 切换引用 ${beforeExt} 处, 补图 ${added.length} 条`)
}
