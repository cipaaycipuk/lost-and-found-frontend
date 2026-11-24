
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
    <aside className="w-full shrink-0 border-b bg-black p-3 md:min-h-[calc(100vh-56px)] md:w-60 md:border-b-0 md:border-r md:p-4">
      <p className="mb-3 hidden px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:block">
        Menu Utama
      </p>

      <nav className="flex gap-2 overflow-x-auto md:flex-col">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border border-orange-500/40 bg-orange-500/10 text-orange-200"
                    : "text-muted-foreground hover:bg-orange-500/10 hover:text-orange-300"
                }`
              }

            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
