import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ClipboardList, Eye, Search, X } from "lucide-react";
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
import { formatDateId, normalizePost } from "@/lib/formatters";

const ITEMS_PER_PAGE = 7;

function normalizeStatus(raw) {
  const s = String(raw || "pending").toLowerCase();
  if (["accepted", "approved", "diterima", "disetujui"].includes(s)) return "accepted";
  if (["rejected", "declined", "ditolak"].includes(s)) return "rejected";
  return "pending";
}

const STATUS_STYLE = {
  pending: { label: "Menunggu", className: "border-0 bg-[#FCEEE3] text-[#c84615]" },
  accepted: { label: "Diterima", className: "border-0 bg-[#E4E8FF] text-[#001994]" },
  rejected: { label: "Ditolak", className: "border-0 bg-[#EDEDED] text-[#515151]" },
};

export default function AdminClaims() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortOrder, setSortOrder] = useState("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [postToView, setPostToView] = useState(null);
  const [claimConfirm, setClaimConfirm] = useState(null);

  const effectiveSearch = (search || urlQuery).trim().toLowerCase();

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["admin", "claims"],
    queryFn: () => adminService.getClaims(),
  });

  const respondMutation = useMutation({
    mutationFn: ({ claimId, status }) =>
      adminService.respondClaim(claimId, { status }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === "accepted" ? "Klaim disetujui." : "Klaim ditolak.",
      );
      setClaimConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => toast.error(err?.message || "Gagal memproses klaim."),
  });

  const filteredClaims = useMemo(() => {
    const result = claims.filter((claim) => {
      const status = normalizeStatus(claim.status);
      const matchesStatus =
        statusFilter === "Semua" || status === statusFilter;

      const itemTitle = claim.post?.title || claim.item || "";
      const claimant = claim.claimer?.name || claim.claimant?.name || "";
      const reporter =
        claim.owner?.name || claim.post?.user?.name || claim.post?.author?.name || "";

      const matchesSearch =
        !effectiveSearch ||
        itemTitle.toLowerCase().includes(effectiveSearch) ||
        claimant.toLowerCase().includes(effectiveSearch) ||
        reporter.toLowerCase().includes(effectiveSearch);

      return matchesStatus && matchesSearch;
    });

    return [...result].sort((a, b) => {
      const tA = new Date(a.created_at || 0).getTime();
      const tB = new Date(b.created_at || 0).getTime();
      return sortOrder === "newest" ? tB - tA : tA - tB;
    });
  }, [claims, statusFilter, sortOrder, effectiveSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedClaims = filteredClaims.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );
  const startItem = filteredClaims.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safePage * ITEMS_PER_PAGE, filteredClaims.length);

  const pendingCount = claims.filter((c) => normalizeStatus(c.status) === "pending").length;
  const acceptedCount = claims.filter((c) => normalizeStatus(c.status) === "accepted").length;
  const rejectedCount = claims.filter((c) => normalizeStatus(c.status) === "rejected").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight tabular-nums">
          Pengajuan Klaim ({filteredClaims.length})
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola dan verifikasi pengajuan klaim barang dari pengguna.
        </p>
      </div>

      <section
        aria-label="Statistik pengajuan klaim"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <AdminStatCard label="Total klaim" value={claims.length} icon={ClipboardList} />
        <AdminStatCard label="Menunggu" value={pendingCount} dot="bg-orange-500" />
        <AdminStatCard label="Diterima" value={acceptedCount} dot="bg-blue-600" />
        <AdminStatCard label="Ditolak" value={rejectedCount} dot="bg-gray-400" />
      </section>

      {/* Filter */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
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
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="accepted">Diterima</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-9 w-32 bg-white text-xs font-medium">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari barang, pengklaim, pelapor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 bg-white pl-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/70">
                <TableHead>Barang</TableHead>
                <TableHead>Pengklaim</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Waktu Pengajuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Memuat pengajuan klaim...
                  </TableCell>
                </TableRow>
              ) : paginatedClaims.length > 0 ? (
                paginatedClaims.map((claim) => {
                  const statusKey = normalizeStatus(claim.status);
                  const badge = STATUS_STYLE[statusKey];
                  const itemTitle = claim.post?.title || claim.item || "Barang";
                  const claimant = claim.claimer?.name || claim.claimant?.name || "-";
                  const reporter =
                    claim.owner?.name ||
                    claim.post?.user?.name ||
                    claim.post?.author?.name ||
                    "-";

                  return (
                    <TableRow key={claim.id}>
                      <TableCell className="min-w-[200px]">
                        <p className="font-medium text-gray-900">{itemTitle}</p>
                        <p className="max-w-[240px] truncate text-xs text-muted-foreground">
                          {claim.message || "-"}
                        </p>
                      </TableCell>
                      <TableCell>{claimant}</TableCell>
                      <TableCell>{reporter}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-600">
                        {claim.created_at ? formatDateId(claim.created_at) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={badge.className}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {claim.post?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs"
                              onClick={() => setPostToView(normalizePost(claim.post))}
                            >
                              <Eye className="mr-1 size-3" /> Lihat
                            </Button>
                          )}
                          {statusKey === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 bg-emerald-600 px-2.5 text-xs text-white hover:bg-emerald-700"
                                onClick={() =>
                                  setClaimConfirm({
                                    claim,
                                    itemTitle,
                                    claimant,
                                    status: "accepted",
                                  })
                                }
                              >
                                <Check className="mr-1 size-3" /> Terima
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() =>
                                  setClaimConfirm({
                                    claim,
                                    itemTitle,
                                    claimant,
                                    status: "rejected",
                                  })
                                }
                              >
                                <X className="mr-1 size-3" /> Tolak
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Tidak ada pengajuan klaim ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground tabular-nums">
            Menampilkan {startItem}-{endItem} dari {filteredClaims.length} pengajuan klaim
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
        open={Boolean(claimConfirm)}
        variant={claimConfirm?.status === "rejected" ? "danger" : "warning"}
        title={
          claimConfirm?.status === "accepted"
            ? "Terima Pengajuan Klaim?"
            : "Tolak Pengajuan Klaim?"
        }
        description={
          <>
            Klaim dari{" "}
            <strong className="font-bold text-gray-900">
              {claimConfirm?.claimant}
            </strong>{" "}
            untuk{" "}
            <strong className="font-bold text-gray-900">
              &ldquo;{claimConfirm?.itemTitle}&rdquo;
            </strong>{" "}
            akan{" "}
            {claimConfirm?.status === "accepted" ? "diterima" : "ditolak"}.
          </>
        }
        confirmLabel={claimConfirm?.status === "accepted" ? "Ya, Terima" : "Ya, Tolak"}
        loading={respondMutation.isPending}
        onConfirm={() =>
          respondMutation.mutate({
            claimId: claimConfirm.claim.id,
            status: claimConfirm.status,
          })
        }
        onCancel={() => setClaimConfirm(null)}
      />
    </div>
  );
}
