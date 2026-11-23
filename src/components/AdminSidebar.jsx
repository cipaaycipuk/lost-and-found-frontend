import { ClipboardCheck, FileText, Users, LayoutDashboard } from "lucide-react";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "posts",
    label: "Postingan",
    icon: FileText,
  },
  {
    id: "users",
    label: "Pengguna",
    icon: Users,
  },
  {
    id: "claims",
    label: "Pengajuan Klaim",
    icon: ClipboardCheck,
  },
];

export default function AdminSidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-full shrink-0 border-b bg-black p-3 md:min-h-[calc(100vh-56px)] md:w-60 md:border-b-0 md:border-r md:p-4">
      <p className="mb-3 hidden px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:block">
        Menu Utama
      </p>

      <nav className="flex gap-2 overflow-x-auto md:flex-col">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-50 text-orange-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
