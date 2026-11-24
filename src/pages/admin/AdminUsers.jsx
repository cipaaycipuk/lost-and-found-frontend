import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, ShieldCheck, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";
import { AdminStatCard } from "@/components/AdminStatCard";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/Avatar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateId } from "@/lib/formatters";

const ITEMS_PER_PAGE = 7;

export default function AdminUsers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [sortOrder, setSortOrder] = useState("Terbaru");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleConfirm, setRoleConfirm] = useState(null);

  const effectiveSearch = (search || urlQuery).trim().toLowerCase();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminService.getUsers(),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("Role pengguna berhasil diperbarui.");
      setRoleConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => toast.error(err?.message || "Gagal memperbarui role pengguna."),
  });

  const filteredUsers = useMemo(() => {
    const result = users.filter((u) => {
      if (!effectiveSearch) return true;
      const wa = u.whatsapp || u.phone || u.phone_number || "";
      return (
        String(u.name || "").toLowerCase().includes(effectiveSearch) ||
        String(u.email || "").toLowerCase().includes(effectiveSearch) ||
        String(wa).toLowerCase().includes(effectiveSearch)
      );
    });

    return [...result].sort((a, b) => {
      const tA = new Date(a.created_at || 0).getTime();
      const tB = new Date(b.created_at || 0).getTime();
      return sortOrder === "Terlama" ? tA - tB : tB - tA;
    });
  }, [users, sortOrder, effectiveSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const currentUsers = filteredUsers.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );
  const startItem = filteredUsers.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safePage * ITEMS_PER_PAGE, filteredUsers.length);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const regularCount = users.length - adminCount;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight tabular-nums">
          Pengguna ({filteredUsers.length})
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau pengguna terdaftar dan kelola hak akses admin kampus.
        </p>
      </div>

      <section
        aria-label="Statistik pengguna"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        <AdminStatCard label="Total pengguna" value={users.length} icon={Users} />
        <AdminStatCard label="Admin" value={adminCount} icon={ShieldCheck} />
        <AdminStatCard label="Pengguna biasa" value={regularCount} icon={UserCheck} />
      </section>

      {/* Sorting & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={sortOrder}
          onValueChange={(val) => {
            setSortOrder(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-36 bg-white text-xs font-medium">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Terbaru">Terbaru</SelectItem>
            <SelectItem value="Terlama">Terlama</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, email, atau WA..."
            className="h-9 bg-white pl-9 text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/70">
                <TableHead>Pengguna</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Postingan</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Memuat data pengguna...
                  </TableCell>
                </TableRow>
              ) : currentUsers.length > 0 ? (
                currentUsers.map((u) => {
                  const postsCount =
                    u.posts_count ??
                    (Array.isArray(u.posts) ? u.posts.length : 0);
                  const isSelf = String(u.id) === String(currentUser?.id);
                  const nextRole = u.role === "admin" ? "user" : "admin";

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="min-w-[160px]">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={u.avatar_url || u.avatar || u.profile_picture}
                            name={u.name}
                            className="size-8 shrink-0 text-xs"
                          />
                          <span className="font-medium">{u.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{u.email || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {u.whatsapp || u.phone || u.phone_number || "-"}
                      </TableCell>
                      <TableCell className="tabular-nums">{postsCount}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            u.role === "admin"
                              ? "bg-[#171717] text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.role || "user"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {u.created_at ? formatDateId(u.created_at) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => navigate(`/profile/${u.id}`)}
                          >
                            <Eye className="mr-1 size-3" /> Profil
                          </Button>
                          {!isSelf && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs"
                              onClick={() => setRoleConfirm({ user: u, nextRole })}
                            >
                              <ShieldCheck className="mr-1 size-3" />
                              {u.role === "admin" ? "Jadikan User" : "Jadikan Admin"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Tidak ada pengguna yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">
            Menampilkan {startItem}-{endItem} dari {filteredUsers.length} pengguna
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span className="px-3 text-sm font-medium tabular-nums">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(roleConfirm)}
        variant="warning"
        title="Ubah Role Pengguna?"
        description={
          <>
            Ubah role{" "}
            <strong className="font-bold text-gray-900">
              {roleConfirm?.user?.name}
            </strong>{" "}
            menjadi{" "}
            <strong className="font-bold uppercase text-gray-900">
              {roleConfirm?.nextRole}
            </strong>
            ?
          </>
        }
        confirmLabel="Ya, Ubah Role"
        loading={roleMutation.isPending}
        onConfirm={() =>
          roleMutation.mutate({
            userId: roleConfirm.user.id,
            role: roleConfirm.nextRole,
          })
        }
        onCancel={() => setRoleConfirm(null)}
      />
    </div>
  );
}
