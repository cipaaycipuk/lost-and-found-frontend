import { NavLink } from "react-router-dom";
import {
  ClipboardCheck,
  FileText,
  Users,
  LayoutDashboard,
} from "lucide-react";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "posts",
    label: "Postingan",
    path: "/admin/posts",
    icon: FileText,
  },
  {
    id: "users",
    label: "Pengguna",
    path: "/admin/users",
    icon: Users,
  },
  {
    id: "claims",
    label: "Pengajuan Klaim",
    path: "/admin/claims",
    icon: ClipboardCheck,
  },
];

export default function AdminSidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-white/10 bg-[#111111] px-4 py-2.5 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-60 md:overflow-y-auto md:border-b-0 md:border-r md:p-4">
      <p className="mb-3 hidden px-3 text-[10px] font-semibold uppercase tracking-widest text-white/50 md:block">
        Menu Utama
      </p>

      <nav className="no-scrollbar flex gap-1.5 overflow-x-auto md:flex-col md:gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors md:gap-3 md:px-3.5 md:py-2.5 md:text-sm ${
                  isActive
                    ? "border border-orange-500/40 bg-orange-500/15 text-orange-200"
                    : "border border-transparent text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={17} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
