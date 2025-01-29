import { ReactNode } from "react";

type ReportLayoutProps = {
  children: ReactNode;
};

export default function ReportLayout({ children }: ReportLayoutProps) {
  return (
    <div className="mx-auto min-h-screen flex flex-col gap-8 row-start-1 items-center sm:items-start transition-colors duration-200">
      {children}
    </div>
  );
}
