/** 路由懒加载时的占位骨架，避免切换页面出现空白 */
export default function PageLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10" aria-busy="true" aria-label="页面加载中">
      <div className="h-8 w-48 animate-pulse rounded bg-cream-200" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-cream-200/70" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-cream-100">
            <div className="aspect-[4/3] animate-pulse bg-cream-200/70" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-cream-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-cream-200/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
