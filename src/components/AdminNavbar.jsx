import { useEffect, useState } from "react";
import { ArrowLeft, CircleUserRound, LogOut, Search, X } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [search, setSearch] = useState(urlQuery);

  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  const handleSearchChange = (value) => {
    setSearch(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  };

  const handleLogout = async () => {
    const promise = logout();
    toast.promise(promise, {
      loading: "Keluar dari akun...",
      success: "Berhasil keluar akun.",
      error: "Gagal keluar akun.",
    });
    await promise;
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#111111] text-white">
      <div className="flex h-full w-full items-center gap-2.5 px-4 sm:gap-4 sm:px-6">
        <Link
          to="/admin/dashboard"
          aria-label="Dashboard Admin"
          className="flex shrink-0 items-center gap-2.5 transition hover:opacity-90"
        >
          <img
            src="/solo.png"
            alt="Lost & Found"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="hidden text-sm font-bold tracking-tight text-white md:inline">
            Admin
          </span>
        </Link>

        <div className="relative min-w-0 flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/55" />
          <Input
            aria-label="Cari di halaman admin"
            placeholder="Cari laporan, pengguna, atau klaim..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 w-full rounded-full border-0 bg-white/15 pl-9 pr-8 text-xs text-white placeholder:text-white/60 focus-visible:bg-white/20 focus-visible:ring-1 focus-visible:ring-orange-500"
          />
          {search && (
            <button
              type="button"
              aria-label="Hapus pencarian"
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-white/60 transition hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            to="/"
            className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:bg-white/20 hover:text-white sm:inline-flex"
          >
            <ArrowLeft className="size-3.5" />
            Beranda
          </Link>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-orange-500/40 bg-orange-500/10 px-2.5 text-xs text-orange-200 hover:bg-orange-500/20 hover:text-white sm:px-3.5"
          >
            <LogOut className="size-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>

          <Link
            to="/profile"
            aria-label={user?.name ? `Profil ${user.name}` : "Profil admin"}
            title={user?.name ? `Profil (${user.name})` : "Profil saya"}
            className="rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <CircleUserRound className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
