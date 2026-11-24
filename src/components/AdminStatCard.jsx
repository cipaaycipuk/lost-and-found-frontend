import { Card, CardContent } from "@/components/ui/card";

export function AdminStatCard({ label, value, icon: Icon, dot }) {
  return (
    <Card className="min-w-0 border border-gray-200/80 bg-white shadow-sm">
      <CardContent className="p-3.5 sm:p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
          {dot ? <span className={`size-1.5 rounded-full ${dot}`} /> : null}
          {Icon ? <Icon className="size-3.5" /> : null}
          <span className="truncate">{label}</span>
        </div>
        <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
