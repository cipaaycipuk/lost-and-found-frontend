import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, Package, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";
import { AdminStatCard } from "@/components/AdminStatCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import PostDetailModal from "@/components/PostDetailModal";
import { Badge } from "@/components/ui/badge";
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
import { formatDateId, normalizePost, resolveMediaUrl } from "@/lib/formatters";

const ITEMS_PER_PAGE = 7;

function TypeBadge({ type }) {
  const isFound = String(type).toLowerCase() === "ditemukan";
  return (
    <Badge
      className={
        isFound
          ? "border-0 bg-blue-100 text-blue-700 hover:bg-blue-100"
          : "border-0 bg-orange-100 text-orange-700 hover:bg-orange-100"
      }
    >
      {isFound ? "Ditemukan" : "Kehilangan"}
    </Badge>
  );
}

function StatusBadge({ status }) {
  const done = ["selesai", "resolved"].includes(String(status || "").toLowerCase());
  return (
    <Badge
      className={
        done
          ? "border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
          : "border-0 bg-orange-50 text-orange-700 hover:bg-orange-50"
      }
    >
      {done ? "Selesai" : "Aktif"}
    </Badge>
  );
}

export default function AdminPosts() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [typeFilter, setTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortOrder, setSortOrder] = useState("Terbaru");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [postToView, setPostToView] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);

  const effectiveSearch = (search || urlQuery).trim().toLowerCase();

  const { data: rawPosts = [], isLoading } = useQuery({
    queryKey: ["admin", "posts"],
    queryFn: () => adminService.getPosts(),
  });

  const posts = useMemo(
    () => rawPosts.filter((p) => !p.deleted_at),
    [rawPosts],
  );

  const deletePostMutation = useMutation({
    mutationFn: (id) => adminService.deletePost(id),
    onSuccess: (_, deletedId) => {
      toast.success("Postingan berhasil dihapus.");
      queryClient.setQueryData(["admin", "posts"], (old) =>
        Array.isArray(old) ? old.filter((p) => p.id !== deletedId) : old,
      );
      setPostToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => toast.error(err?.message || "Gagal menghapus postingan."),
  });

  const filteredPosts = useMemo(() => {
    const result = posts.filter((post) => {
      const pType = String(post.type || "").toLowerCase();
      const matchesType =
        typeFilter === "Semua" || pType === typeFilter.toLowerCase();

      const isDone = ["selesai", "resolved"].includes(
        String(post.status || "").toLowerCase(),
      );
      const matchesStatus =
        statusFilter === "Semua" ||
        (statusFilter === "Selesai" && isDone) ||
        (statusFilter === "Aktif" && !isDone && !post.deleted_at);

      const authorName = post.user?.name || post.author?.name || "";
      const matchesSearch =
        !effectiveSearch ||
        String(post.title || "").toLowerCase().includes(effectiveSearch) ||
        authorName.toLowerCase().includes(effectiveSearch) ||
        String(post.category || "").toLowerCase().includes(effectiveSearch);

      return matchesType && matchesStatus && matchesSearch;
    });

    return [...result].sort((a, b) => {
      const tA = new Date(a.created_at || 0).getTime();
      const tB = new Date(b.created_at || 0).getTime();
      return sortOrder === "Terlama" ? tA - tB : tB - tA;
    });
  }, [posts, typeFilter, statusFilter, sortOrder, effectiveSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const currentPosts = filteredPosts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );
  const startItem = filteredPosts.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safePage * ITEMS_PER_PAGE, filteredPosts.length);

  const lostCount = posts.filter(
    (p) => String(p.type || "").toLowerCase() !== "ditemukan",
  ).length;
  const foundCount = posts.filter(
    (p) => String(p.type || "").toLowerCase() === "ditemukan",
  ).length;
  const resolvedCount = posts.filter((p) =>
    ["selesai", "resolved"].includes(String(p.status || "").toLowerCase()),
  ).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight tabular-nums">
          Postingan ({filteredPosts.length})
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau laporan yang masuk dan kelola postingan yang tidak pantas.
        </p>
      </div>

      <section
        aria-label="Statistik postingan"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <AdminStatCard label="Total laporan" value={posts.length} icon={Package} />
        <AdminStatCard label="Kehilangan" value={lostCount} dot="bg-orange-500" />
        <AdminStatCard label="Ditemukan" value={foundCount} dot="bg-blue-600" />
        <AdminStatCard label="Selesai" value={resolvedCount} icon={CheckCircle2} />
      </section>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-gray-200/80 bg-white p-1 shadow-xs">
            {["Semua", "Kehilangan", "Ditemukan"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setTypeFilter(type);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  typeFilter === type
                    ? "bg-[#171717] text-white"
                    : "text-muted-foreground hover:bg-gray-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-36 bg-white text-xs font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua status</SelectItem>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-9 w-32 bg-white text-xs font-medium">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Terbaru">Terbaru</SelectItem>
              <SelectItem value="Terlama">Terlama</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full xl:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari judul, pelapor, kategori..."
            className="h-9 bg-white pl-9 text-xs"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/70">
                <TableHead>Postingan</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Dilaporkan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Memuat postingan...
                  </TableCell>
                </TableRow>
              ) : currentPosts.length > 0 ? (
                currentPosts.map((post) => {
                  const thumb = resolveMediaUrl(
                    Array.isArray(post.images) && post.images.length > 0
                      ? post.images[0]
                      : post.image,
                  );
                  return (
                    <TableRow key={post.id}>
                      <TableCell className="min-w-[230px]">
                        <div className="flex items-center gap-2.5">
                          <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={post.title}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="grid size-full place-items-center text-muted-foreground">
                                <Package className="size-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{post.title}</p>
                            <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                              {post.description || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{post.user?.name || post.author?.name || "-"}</TableCell>
                      <TableCell>
                        <TypeBadge type={post.type} />
                      </TableCell>
                      <TableCell>{post.category || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {post.created_at ? formatDateId(post.created_at) : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={post.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => setPostToView(normalizePost(post))}
                          >
                            <Eye className="mr-1 size-3" /> Lihat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setPostToDelete(post)}
                          >
                            <Trash2 className="mr-1 size-3" /> Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Tidak ada postingan yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">
            Menampilkan {startItem}-{endItem} dari {filteredPosts.length} postingan
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

      {postToView && (
        <PostDetailModal post={postToView} onClose={() => setPostToView(null)} />
      )}

      <ConfirmDialog
        open={Boolean(postToDelete)}
        variant="danger"
        title="Hapus Postingan?"
        description={
          <>
            Apakah Anda yakin ingin menghapus postingan{" "}
            <strong className="font-bold text-gray-900">
              &ldquo;{postToDelete?.title}&rdquo;
            </strong>
            ?
          </>
        }
        subDescription="Tindakan ini tidak dapat dibatalkan. Postingan yang dihapus tidak dapat dipulihkan kembali."
        confirmLabel="Ya, Hapus"
        loading={deletePostMutation.isPending}
        onConfirm={() => deletePostMutation.mutate(postToDelete.id)}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  );
}
