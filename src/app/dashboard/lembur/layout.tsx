import { ReactNode } from 'react'

type LemburLayoutProps = {
  children: ReactNode
}

export default function LemburLayout({ children }: LemburLayoutProps) {
  return (
    <div className="flex flex-col gap-8 row-start-1 items-center sm:items-start">{children}</div>
  )
}
