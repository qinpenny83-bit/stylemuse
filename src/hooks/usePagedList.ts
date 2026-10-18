import { useEffect, useMemo, useState } from 'react'

/** 列表分页：首屏只渲染一页，其余按需展开，避免一次加载几十张图 */
export function usePagedList<T>(items: T[], pageSize = 12) {
  const [page, setPage] = useState(1)

  // 筛选条件变化后回到第一页
  useEffect(() => {
    setPage(1)
  }, [items])

  const visible = useMemo(() => items.slice(0, page * pageSize), [items, page, pageSize])
  const hasMore = visible.length < items.length

  return {
    visible,
    hasMore,
    remaining: items.length - visible.length,
    loadMore: () => setPage((p) => p + 1),
  }
}
