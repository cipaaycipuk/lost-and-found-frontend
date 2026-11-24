import { CircleUserRound, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 h-18 border-b border-white/10 bg-[#111111] text-white">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-3 px-4 sm:px-6">
        <div>
          <img
            src="/solo.png"
            alt="Lost & Found"
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Cari laporan atau pengguna"
            placeholder="Cari laporan atau pengguna..."
            className="h-9 rounded-full border-0 bg-[#454545] pl-9 text-xs text-white placeholder:text-white/60 focus-visible:ring-orange-500"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-orange-500/40 bg-orange-500/10 px-4 text-xs text-orange-200 hover:bg-orange-500/20 hover:text-white"
          >
            <LogOut className="mr-1.5 size-3.5" />
            Logout
          </Button>
          <button
            aria-label="Profil admin"
            className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <CircleUserRound className="size-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
