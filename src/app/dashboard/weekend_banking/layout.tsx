import { ReactNode } from "react";

type WeekendLayoutProps = {
  children: ReactNode;
};

export default function WeekendLayout({ children }: WeekendLayoutProps) {
  return (
    <div className="flex flex-col gap-8 row-start-1 items-center sm:items-start overflow-hidden">
      {children}
    </div>
  );
}
