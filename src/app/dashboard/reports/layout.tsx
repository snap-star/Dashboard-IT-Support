import { ReactNode } from "react";

type ReportLayoutProps = {
  children: ReactNode
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return (
    <div className="flex flex-col gap-8 row-start-1 items-center sm:items-start">
      {children}
    </div>
  )
}