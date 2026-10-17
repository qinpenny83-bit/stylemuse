const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const map = {
  'pirate-20': 'expressive-maximalism', 'sporty-luxe': 'sporty-prep', 'jelly-shoes': 'disordered-ballet',
  'maximal-belts': 'expressive-maximalism', 'mocha-mousse': 'brown-leather', 'ballet-core': 'disordered-ballet',
  'old-money': 'expressive-maximalism', 'y2k': 'low-rise',
  'satin-skin': 'glazed-skin', 'dark-cherry-lips': 'oxblood-lip', 'blush-renaissance': 'barely-there-blush',
  'purple-blush': 'barely-there-blush', 'skinny-brows': 'feathered-brows', 'eyeliner-revival': 'soft-smudged-liner',
  'nineties-lips': 'juicy-glossy-lips', 'frosted-makeup': 'bold-color-eyes', 'lazy-beauty': 'morning-after-beauty',
  'clean-girl': 'glazed-skin', 'bixie': 'boyfriend-bixie', 'pixie': 'soft-power-pixie',
  'smooth-supermodel': 'liquid-lengths', 'copper-hair': 'cowgirl-copper', 'bow-hairstyle': 'hair-jewelry',
}

const files = ['src/data/outfits.ts', 'src/data/makeup.ts', 'src/data/hair.ts']
let total = 0
for (const f of files) {
  const p = path.join(root, f)
  let src = fs.readFileSync(p, 'utf8')
  for (const [oldId, newId] of Object.entries(map)) {
    const oldPat = "trend: '" + oldId + "',"
    const newPat = "trend: '" + newId + "',"
    let idx = src.indexOf(oldPat)
    let hits = 0
    while (idx !== -1) {
      src = src.slice(0, idx) + newPat + src.slice(idx + oldPat.length)
      hits++
      idx = src.indexOf(oldPat, idx + newPat.length)
    }
    if (hits) {
      total += hits
      console.log(f + ': ' + oldId + ' -> ' + newId + ' x' + hits)
    }
  }
  fs.writeFileSync(p, src)
}
console.log('total replacements: ' + total)
