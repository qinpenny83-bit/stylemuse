import type { Style } from '../types'
import { stylesPart1 } from './styles1'
import { stylesPart2 } from './styles2'
import { stylesPart3 } from './styles3'

/** 全部风格（共 22 个） */
export const STYLES: Style[] = [...stylesPart1, ...stylesPart2, ...stylesPart3]

const styleMap = new Map(STYLES.map((s) => [s.id, s]))

export function getStyle(id: string): Style | undefined {
  return styleMap.get(id)
}

export const STYLE_GROUPS = ['甜美系', '酷感系', '优雅系', '休闲系', '个性系'] as const
