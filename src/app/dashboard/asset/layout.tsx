import type { ReactNode } from 'react'

type AssetLayoutProps = {
  children: ReactNode
}

export default function AssetLayout({ children }: AssetLayoutProps) {
  return (
    <div className="flex flex-col gap-8 row-start-1 items-center sm:items-start">{children}</div>
  )
}
