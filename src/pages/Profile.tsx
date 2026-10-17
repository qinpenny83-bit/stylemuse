/* ============================================================
 * 我的形象档案 · 分步分析流程
 * 支持：跳过 / 返回上一步 / 修改答案 / 自动保存进度
 * 原则：照片、身高、体型、脸型、肤色全部允许跳过，手动填写可选
 * 声明：自我描述与系统推断明确区分，不凭照片断言肤色/比例
 * ============================================================ */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Camera, Check, Info, Ruler, Sparkles, UserRound, Palette as PaletteIcon,
  Scissors, Heart, Briefcase, Eye,
} from 'lucide-react'
import type { AdjustmentKey, ImageProfile, PhotoRef } from '../types'
import { useApp } from '../store/AppStore'
import { STYLES, getStyle } from '../data/styles'
import {
  BODY_BUILDS, BUDGETS, CARE_TIMES, COMFORTS, FACE_FEATURES, FACE_SHAPES, GOALS,
  HAIR_CURRENT, HAIR_TEXTURES, HAIR_VOLUMES, HEIGHT_OPTIONS, PERSONAL_COLORS,
  SCENARIOS, SKIN_TONES, UNDERTONES,
} from '../data/options'
import { buildRecommendation, ADJUSTMENT_LABELS } from '../engine/recommend'
import { Notice } from '../components/Feedback'

const STEPS = [
  { key: 'photo', icon: <Camera className="h-4 w-4" />, title: '照片', desc: '可选，帮助分析更贴合' },
  { key: 'body', icon: <Ruler className="h-4 w-4" />, title: '身高体型', desc: '可选' },
  { key: 'face', icon: <UserRound className="h-4 w-4" />, title: '脸型特点', desc: '可选' },
  { key: 'skin', icon: <PaletteIcon className="h-4 w-4" />, title: '肤色色彩', desc: '可选' },
  { key: 'hair', icon: <Scissors className="h-4 w-4" />, title: '头发情况', desc: '可选' },
  { key: 'pref', icon: <Heart className="h-4 w-4" />, title: '风格偏好', desc: '强烈建议' },
  { key: 'life', icon: <Briefcase className="h-4 w-4" />, title: '生活与目标', desc: '强烈建议' },
  { key: 'done', icon: <Sparkles className="h-4 w-4" />, title: '生成推荐', desc: '检查并生成' },
] as const

const emptyProfile = (): ImageProfile => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  step: 0,
  completed: false,
  facePhoto: null,
  bodyPhoto: null,
  height: null,
  body: null,
  faceShape: null,
  faceFeatures: [],
  skinTone: null,
  undertone: null,
  personalColors: [],
  hair: {},
  likedStyles: [],
  dislikedStyles: [],
  scenarios: [],
  budget: null,
  comfort: null,
  goals: [],
  selfDescription: '',
  skipped: [],
})

/** 用 Blob 生成可预览的对象 URL */
function usePhotoUrl(photo: PhotoRef | null | undefined): string | null {
  return useMemo(() => {
    if (!photo) return null
    return URL.createObjectURL(photo.blob)
  }, [photo])
}

function readFileAsBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      resolve(new Blob([arrayBuffer], { type: file.type || 'image/jpeg' }))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/* ---------------- 表单控件 ---------------- */

function OptionChips<T extends string>({
  options,
  selected,
  onToggle,
  render,
  multi,
}: {
  options: readonly T[] | T[]
  selected: T[]
  onToggle: (v: T) => void
  render?: (v: T) => string
  multi: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`chip ${on ? 'chip-on' : ''}`}
          >
            {render ? render(opt) : opt}
            {on && multi && <Check className="h-3.5 w-3.5" />}
          </button>
        )
      })}
    </div>
  )
}

function SingleChoice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { id: T; desc?: string }[]
  value: T | null | undefined
  onChange: (v: T | null) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const on = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(on ? null : opt.id)}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              on ? 'border-rose-500 bg-rose-100/70' : 'border-cream-300 bg-white hover:border-rose-300'
            }`}
          >
            <span className="flex items-center justify-between">
              <span className="text-[14.5px] font-medium text-ink-900">{opt.id}</span>
              {on && <Check className="h-4 w-4 text-rose-600" />}
            </span>
            {opt.desc && <span className="mt-1 block text-[12.5px] text-ink-500">{opt.desc}</span>}
          </button>
        )
      })}
    </div>
  )
}

function ChoiceGrid<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: readonly { id: T; desc?: string; hint?: string }[]
  selected: T[]
  onToggle: (v: T) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const on = selected.includes(opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              on ? 'border-rose-500 bg-rose-100/70' : 'border-cream-300 bg-white hover:border-rose-300'
            }`}
          >
            <span className="flex items-center justify-between">
              <span className="text-[14.5px] font-medium text-ink-900">{opt.id}</span>
              {on && <Check className="h-4 w-4 text-rose-600" />}
            </span>
            {opt.hint && <span className="mt-1 block text-[12.5px] text-ink-500">{opt.hint}</span>}
            {opt.desc && !opt.hint && <span className="mt-1 block text-[12.5px] text-ink-500">{opt.desc}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- 分步内容 ---------------- */

function PhotoStep({ draft, onChange }: { draft: ImageProfile; onChange: (p: ImageProfile) => void }) {
  const faceUrl = usePhotoUrl(draft.facePhoto)
  const bodyUrl = usePhotoUrl(draft.bodyPhoto)

  const upload = async (which: 'facePhoto' | 'bodyPhoto', file: File | undefined) => {
    if (!file) return
    const blob = await readFileAsBlob(file)
    const photo: PhotoRef = { blob, note: '本机拍摄/选择，仅存于浏览器本地', mime: file.type }
    onChange({ ...draft, [which]: photo, skipped: draft.skipped.filter((s) => s !== which) })
  }

  const PhotoBox = ({
    title,
    desc,
    url,
    onPick,
    onRemove,
    canSkip,
    skipped,
  }: {
    title: string
    desc: string
    url: string | null
    onPick: (f: File | undefined) => void
    onRemove: () => void
    canSkip?: boolean
    skipped?: boolean
  }) => (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[15px] font-medium text-ink-900">{title}</p>
        {skipped && <span className="text-[12px] text-ink-400">已跳过</span>}
      </div>
      {url ? (
        <div className="overflow-hidden rounded-xl">
          <img src={url} alt={title} className="h-52 w-full object-cover" />
        </div>
      ) : (
        <label className="flex h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cream-300 bg-cream-100/50 transition-colors hover:border-rose-400 hover:bg-rose-100/30">
          <Camera className="h-6 w-6 text-ink-400" />
          <span className="text-[13px] text-ink-500">{desc}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPick(e.target.files?.[0])} />
        </label>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {url ? (
          <>
            <label className="chip cursor-pointer">
              <Camera className="h-3.5 w-3.5" /> 重新选择
              <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPick(e.target.files?.[0])} />
            </label>
            <button type="button" className="chip" onClick={onRemove}>移除</button>
          </>
        ) : (
          canSkip && (
            <button type="button" className="chip" onClick={onRemove}>
              跳过（不提供照片）
            </button>
          )
        )}
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-ink-400">
        照片仅保存在浏览器本地，用于生成对象 URL 预览与辅助分析；不会上传任何服务器。
      </p>
    </div>
  )

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PhotoBox
        title="正面照片"
        desc="点击上传一张清晰的正面照"
        url={faceUrl}
        onPick={(f) => void upload('facePhoto', f)}
        onRemove={() => {
          if (draft.facePhoto) onChange({ ...draft, facePhoto: null, skipped: [...new Set([...draft.skipped, 'facePhoto'])] })
          else onChange({ ...draft, skipped: draft.skipped.filter((s) => s !== 'facePhoto') })
        }}
        canSkip
        skipped={draft.skipped.includes('facePhoto')}
      />
      <PhotoBox
        title="全身照片"
        desc="可选，用于版型与比例建议"
        url={bodyUrl}
        onPick={(f) => void upload('bodyPhoto', f)}
        onRemove={() => {
          if (draft.bodyPhoto) onChange({ ...draft, bodyPhoto: null, skipped: [...new Set([...draft.skipped, 'bodyPhoto'])] })
          else onChange({ ...draft, skipped: draft.skipped.filter((s) => s !== 'bodyPhoto') })
        }}
        canSkip
        skipped={draft.skipped.includes('bodyPhoto')}
      />
      <div className="md:col-span-2">
        <Notice tone="info">
          照片只作为辅助参考。肤色、精确身材比例与审美类型不会仅凭一张照片断定——请结合你对自己的了解在后续步骤中补充描述。
        </Notice>
      </div>
    </div>
  )
}

function BodyStep({ draft, onChange }: { draft: ImageProfile; onChange: (p: ImageProfile) => void }) {
  const heightOptions = HEIGHT_OPTIONS
  const [heightText, setHeightText] = useState(draft.height ? String(draft.height) : '')
  return (
    <div className="space-y-6">
      <div>
        <p className="field-label">身高（厘米，可选）</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            min={120}
            max={200}
            placeholder="例如 162"
            value={heightText}
            onChange={(e) => {
              setHeightText(e.target.value)
              const n = Number(e.target.value)
              onChange({ ...draft, height: n >= 120 && n <= 200 ? n : null })
            }}
            className="field-input w-36"
          />
          <button
            type="button"
            className="chip"
            onClick={() => {
              setHeightText('')
              onChange({ ...draft, height: null })
            }}
          >
            清除
          </button>
          <span className="text-[12px] text-ink-400">或按大致范围选择：</span>
          {heightOptions.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                setHeightText('')
                onChange({ ...draft, height: h })
              }}
              className={`chip ${draft.height === h ? 'chip-on' : ''}`}
            >
              {h}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-ink-400">* 字符串选项仅记录区间，用于版型参考，不用于精确计算。</p>
      </div>
      <div>
        <p className="field-label">整体体型（可选，自我描述）</p>
        <SingleChoice
          options={BODY_BUILDS}
          value={draft.body?.build}
          onChange={(v) => onChange({ ...draft, body: { ...draft.body, build: v ?? undefined } })}
        />
      </div>
      <div>
        <p className="field-label">身材目标（不定义优劣，只表达你的偏好）</p>
        <SingleChoice
          options={[
            { id: '突出曲线', desc: '希望强调身材曲线' },
            { id: '宽松舒适', desc: '喜欢宽松、不束缚的感觉' },
            { id: '强调利落', desc: '喜欢直线条、利落的剪裁' },
            { id: '显高显瘦', desc: '希望视觉上更修长' },
            { id: '舒服就好', desc: '没有特别的修饰需求' },
          ]}
          value={draft.body?.goal as '突出曲线' | '宽松舒适' | '强调利落' | '显高显瘦' | '舒服就好' | undefined}
          onChange={(v) => onChange({ ...draft, body: { ...draft.body, goal: v ?? undefined } })}
        />
      </div>
    </div>
  )
}

function FaceStep({ draft, onChange }: { draft: ImageProfile; onChange: (p: ImageProfile) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="field-label">脸型（可选，凭感觉选就好）</p>
        <ChoiceGrid
          options={FACE_SHAPES as unknown as { id: string; desc?: string; hint?: string }[]}
          selected={draft.faceShape ? [draft.faceShape] : []}
          onToggle={(v) => onChange({ ...draft, faceShape: draft.faceShape === v ? null : v })}
        />
      </div>
      <div>
        <p className="field-label">面部特点（可选，多选）</p>
        <OptionChips
          options={FACE_FEATURES}
          selected={draft.faceFeatures}
          multi
          onToggle={(v) =>
            onChange({
              ...draft,
              faceFeatures: draft.faceFeatures.includes(v)
                ? draft.faceFeatures.filter((x) => x !== v)
                : [...draft.faceFeatures, v],
            })
          }
        />
        <p className="mt-2 text-[12px] text-ink-400">这些描述会与推荐理由关联，例如高颧骨的修饰思路。</p>
      </div>
    </div>
  )
}

function SkinStep({ draft, onChange }: { draft: ImageProfile; onChange: (p: ImageProfile) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="field-label">肤色（可选，自我描述）</p>
        <SingleChoice
          options={SKIN_TONES}
          value={draft.skinTone}
          onChange={(v) => onChange({ ...draft, skinTone: v ?? null })}
        />
      </div>
      <div>
        <p className="field-label">肤色基调（可选）</p>
        <SingleChoice
          options={UNDERTONES}
          value={draft.undertone}
          onChange={(v) => onChange({ ...draft, undertone: v ?? null })}
        />
      </div>
      <div>
        <p className="field-label">个人色彩倾向（可选，不懂可直接选「不确定」）</p>
        <OptionChips
          options={PERSONAL_COLORS}
          selected={draft.personalColors}
          multi={false}
          onToggle={(v) =>
            onChange({
              ...draft,
              personalColors: draft.personalColors.includes(v) ? [] : [v],
            })
          }
        />
      </div>
    </div>
  )
}

function HairStep({ draft, onChange }: { draft: ImageProfile; onChange: (p: ImageProfile) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="field-label">发质（可选）</p>
        <OptionChips
          options={HAIR_TEXTURES}
          selected={draft.hair.texture ? [draft.hair.texture] : []}
          multi={false}
          onToggle={(v) => onChange({ ...draft, hair: { ...draft.hair, texture: draft.hair.texture === v ? undefined : v } })}
        />
      </div>
      <div>
        <p className="field-label">发量（可选）</p>
        <OptionChips
          options={HAIR_VOLUMES}
          selected={draft.hair.volume ? [draft.hair.volume] : []}
          multi={false}
          onToggle={(v) => onChange({ ...draft, hair: { ...draft.hair, volume: draft.hair.volume === v ? undefined : v } })}
        />
      </div>
      <div>
        <p className="field-label">当前发型（可选）</p>
        <OptionChips
          options={HAIR_CURRENT}
          selected={draft.hair.current ? [draft.hair.current] : []}
          multi={false}
          onToggle={(v) => onChange({ ...draft, hair: { ...draft.hair, current: draft.hair.current === v ? undefined : v } })}
        />
      </div>
      <div>
        <p className="field-label">每天愿意花在打理头发上的时间（可选）</p>
        <div className="flex flex-wrap gap-2">
          {CARE_TIMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...draft, hair: { ...draft.hair, careTime: draft.hair.careTime === t ? undefined : t } })}
              className={`chip ${draft.hair.careTime === t ? 'chip-on' : ''}`}
            >
              {t === 0 ? '不花时间' : `约 ${t} 分钟`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PrefStep({ draft, onChange }: { draft: ImageProfile; onChange: (p: ImageProfile) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="field-label">喜欢的风格（可多选，后续可混合）</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {STYLES.map((s) => {
            const on = draft.likedStyles.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...draft,
                    likedStyles: on
                      ? draft.likedStyles.filter((x) => x !== s.id)
                      : [...draft.likedStyles, s.id],
                  })
                }
                className={`flex flex-col rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  on ? 'border-rose-500 bg-rose-100/70' : 'border-cream-300 bg-white hover:border-rose-300'
                }`}
              >
                <span className="flex items-center justify-between text-[13.5px] font-medium text-ink-900">
                  {s.name}
                  {on && <Check className="h-3.5 w-3.5 text-rose-600" />}
                </span>
                <span className="mt-0.5 truncate text-[11.5px] text-ink-400">{s.tagline}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="field-label">明确不喜欢/不想尝试的风格（可选）</p>
        <div className="flex flex-wrap gap-2">
          {STYLES.filter((s) => !draft.likedStyles.includes(s.id)).map((s) => {
            const on = draft.dislikedStyles.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...draft,
                    dislikedStyles: on
                      ? draft.dislikedStyles.filter((x) => x !== s.id)
                      : [...draft.dislikedStyles, s.id],
                  })
                }
                className={`chip ${on ? 'border-ink-900 bg-ink-900 text-cream-100' : ''}`}
              >
                {s.name}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-[12px] text-ink-400">讨厌的风格会从推荐中排除，并避免被建议。</p>
      </div>
    </div>
  )
}

function LifeStep({ draft, onChange }: { draft: ImageProfile; onChange: (p: ImageProfile) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="field-label">常见穿衣场景（可多选）</p>
        <OptionChips
          options={SCENARIOS}
          selected={draft.scenarios}
          multi
          onToggle={(v) =>
            onChange({
              ...draft,
              scenarios: draft.scenarios.includes(v)
                ? draft.scenarios.filter((x) => x !== v)
                : [...draft.scenarios, v],
            })
          }
        />
      </div>
      <div>
        <p className="field-label">月均置装预算（可选）</p>
        <SingleChoice
          options={BUDGETS}
          value={draft.budget}
          onChange={(v) => onChange({ ...draft, budget: v ?? null })}
        />
      </div>
      <div>
        <p className="field-label">舒适度偏好（可选）</p>
        <SingleChoice
          options={COMFORTS}
          value={draft.comfort}
          onChange={(v) => onChange({ ...draft, comfort: v ?? null })}
        />
      </div>
      <div>
        <p className="field-label">形象目标（可多选）</p>
        <OptionChips
          options={GOALS}
          selected={draft.goals}
          multi
          onToggle={(v) =>
            onChange({
              ...draft,
              goals: draft.goals.includes(v)
                ? draft.goals.filter((x) => x !== v)
                : [...draft.goals, v],
            })
          }
        />
      </div>
      <div>
        <p className="field-label">补充描述（可选）</p>
        <textarea
          value={draft.selfDescription ?? ''}
          onChange={(e) => onChange({ ...draft, selfDescription: e.target.value })}
          placeholder="例如：工作经常要见客户；皮肤偏敏感；身高不高想显高；喜欢小众设计师品牌……"
          rows={3}
          className="field-input resize-none"
        />
      </div>
    </div>
  )
}

function ReviewStep({ draft }: { draft: ImageProfile }) {
  const [adjustments, setAdjustments] = useState<AdjustmentKey[]>([])
  const [generating, setGenerating] = useState(false)
  const { addRecommendation, upsertProfile } = useApp()
  const navigate = useNavigate()

  const sections: { label: string; value: string; present: boolean }[] = [
    { label: '正面照片', value: draft.facePhoto ? '已提供' : '未提供（已跳过或未上传）', present: Boolean(draft.facePhoto) },
    { label: '身高', value: draft.height ? String(draft.height) : '未填写', present: Boolean(draft.height) },
    { label: '脸型', value: draft.faceShape ?? '未填写', present: Boolean(draft.faceShape) },
    { label: '肤色', value: [draft.skinTone, draft.undertone].filter(Boolean).join(' / ') || '未填写', present: Boolean(draft.skinTone || draft.undertone) },
    { label: '头发情况', value: [draft.hair.texture, draft.hair.volume, draft.hair.current].filter(Boolean).join(' / ') || '未填写', present: Boolean(draft.hair.texture || draft.hair.volume || draft.hair.current) },
    { label: '喜欢的风格', value: draft.likedStyles.map((id) => getStyle(id)?.name).filter(Boolean).join('、') || '未选择', present: draft.likedStyles.length > 0 },
    { label: '生活场景', value: draft.scenarios.join('、') || '未选择', present: draft.scenarios.length > 0 },
    { label: '形象目标', value: draft.goals.join('、') || '未选择', present: draft.goals.length > 0 },
  ]

  const handleGenerate = async () => {
    if (generating) return
    setGenerating(true)
    try {
      const rec = buildRecommendation(draft, adjustments)
      await addRecommendation(rec)
      const saved: ImageProfile = { ...draft, completed: true, updatedAt: new Date().toISOString() }
      await upsertProfile(saved)
      navigate('/results')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <p className="mb-3 flex items-center gap-2 text-[15px] font-medium text-ink-900">
          <Eye className="h-4 w-4 text-rose-600" /> 档案摘要
        </p>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {sections.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between gap-3 border-b border-cream-200/60 py-1.5">
              <dt className="shrink-0 text-[13px] text-ink-500">{s.label}</dt>
              <dd className={`truncate text-right text-[13px] ${s.present ? 'text-ink-900' : 'text-ink-400'}`}>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-400">
          如需修改，返回对应步骤即可；未填写的信息会在推荐结果中明确标注为「信息不足」，不会编造结论。
        </p>
      </div>

      <div className="card p-5">
        <p className="mb-1 text-[15px] font-medium text-ink-900">生成时预置调整（可选）</p>
        <p className="mb-3 text-[12.5px] text-ink-400">可在推荐结果页再次调整，这里先做一次。</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ADJUSTMENT_LABELS) as AdjustmentKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() =>
                setAdjustments((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
              }
              className={`chip ${adjustments.includes(k) ? 'chip-on' : ''}`}
            >
              {ADJUSTMENT_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={() => void handleGenerate()} disabled={generating} className="btn-accent w-full md:w-auto">
        <Sparkles className="h-4 w-4" />
        {generating ? '正在生成…' : '生成我的专属推荐'}
      </button>
    </div>
  )
}

/* ---------------- 主页面 ---------------- */

export default function Profile() {
  const { currentProfile, upsertProfile, ready } = useApp()
  const [draft, setDraft] = useState<ImageProfile | null>(null)
  const [step, setStep] = useState(0)
  const saveTimer = useRef<number | null>(null)

  // 初始化草稿：优先使用最近档案，否则新建
  useEffect(() => {
    if (!ready) return
    if (!draft) {
      setDraft(currentProfile ? { ...currentProfile } : emptyProfile())
      setStep(currentProfile?.step ?? 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // 每次变更自动保存进度（防抖）
  useEffect(() => {
    if (!draft) return
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      void upsertProfile({ ...draft, updatedAt: new Date().toISOString() })
    }, 400)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const skipStep = (idx: number) => {
    if (!draft) return
    const key = STEPS[idx].key
    const skipped = draft.skipped.includes(key) ? draft.skipped : [...draft.skipped, key]
    setDraft({ ...draft, skipped, step: Math.min(idx + 1, STEPS.length - 1) })
    setStep(Math.min(idx + 1, STEPS.length - 1))
  }

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-ink-400">正在加载本地数据…</div>
  }

  const cur = STEPS[step]
  const isDone = step === STEPS.length - 1
  const progress = Math.round((step / (STEPS.length - 1)) * 100)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回首页
      </Link>

      <div className="mb-8">
        <p className="eyebrow mb-2 text-rose-600">My Style Profile</p>
        <h1 className="font-display text-[28px] font-semibold text-ink-900 md:text-[34px]">我的形象档案</h1>
        <p className="mt-2 text-[14px] text-ink-500">
          共 {STEPS.length - 1} 步，可随时跳过或返回修改，进度会自动保存。
        </p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-cream-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-gold-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 步骤导航 */}
      <div className="mb-8 flex gap-1.5 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStep(Math.min(i, draft?.step ?? 0) >= i ? i : step)}
            disabled={i > (draft?.step ?? 0) && i !== step}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] transition-colors ${
              i === step
                ? 'bg-ink-900 text-cream-100'
                : i < (draft?.step ?? 0) || i === step
                  ? 'text-ink-700 hover:bg-cream-200'
                  : 'text-ink-400'
            }`}
          >
            {s.icon}
            {s.title}
          </button>
        ))}
      </div>

      <div key={step} className="card animate-fade-up p-6 md:p-8">
        <div className="mb-6">
          <h2 className="font-display text-[21px] font-semibold text-ink-900">{cur.title}</h2>
          <p className="mt-1 text-[13.5px] text-ink-500">{cur.desc}</p>
        </div>

        {draft && step === 0 && <PhotoStep draft={draft} onChange={setDraft} />}
        {draft && step === 1 && <BodyStep draft={draft} onChange={setDraft} />}
        {draft && step === 2 && <FaceStep draft={draft} onChange={setDraft} />}
        {draft && step === 3 && <SkinStep draft={draft} onChange={setDraft} />}
        {draft && step === 4 && <HairStep draft={draft} onChange={setDraft} />}
        {draft && step === 5 && <PrefStep draft={draft} onChange={setDraft} />}
        {draft && step === 6 && <LifeStep draft={draft} onChange={setDraft} />}
        {draft && step === 7 && <ReviewStep draft={draft} />}

        <div className="mt-8 flex items-center justify-between border-t border-cream-200/60 pt-5">
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => {
                  const next = step - 1
                  setStep(next)
                  setDraft((d) => (d ? { ...d, step: next } : d))
                }}
                className="btn-ghost"
              >
                <ArrowLeft className="h-4 w-4" /> 上一步
              </button>
            )}
            {!isDone && (
              <button type="button" onClick={() => skipStep(step)} className="btn-ghost">
                <Info className="h-4 w-4" /> 跳过此步
              </button>
            )}
          </div>
          {!isDone && (
            <button
              type="button"
              onClick={() => {
                const next = step + 1
                setStep(next)
                setDraft((d) => (d ? { ...d, step: next, skipped: d.skipped.filter((s) => s !== STEPS[step].key) } : d))
              }}
              className="btn-primary"
            >
              {step === STEPS.length - 2 ? '去生成推荐' : '下一步'} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
