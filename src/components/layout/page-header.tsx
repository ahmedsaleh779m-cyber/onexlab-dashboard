import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6 border-b border-[#1f1f1f] mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="text-sm text-[#737373] mt-1">{subtitle}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
