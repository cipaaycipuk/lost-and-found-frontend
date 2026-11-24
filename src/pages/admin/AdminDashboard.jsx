import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, Package, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";
import Avatar from "@/components/Avatar";
import ConfirmDialog from "@/components/ConfirmDialog";
import PostDetailModal from "@/components/PostDetailModal";
import { AdminStatCard } from "@/components/AdminStatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateId, normalizePost, resolveMediaUrl } from "@/lib/formatters";

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
  const s = String(status || "").toLowerCase();
  const isDone = ["selesai", "resolved", "diterima", "accepted"].includes(s);
  const isRejected = ["ditolak", "rejected"].includes(s);
  const label =
    s === "accepted" || s === "diterima"
      ? "Diterima"
      : s === "rejected" || s === "ditolak"
        ? "Ditolak"
        : s === "pending"
          ? "Menunggu"
          : isDone
            ? "Selesai"
            : "Aktif";

  return (
    <Badge
      className={
        isDone
          ? "border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
          : isRejected
            ? "border-0 bg-gray-100 text-gray-700 hover:bg-gray-100"
            : "border-0 bg-orange-50 text-orange-700 hover:bg-orange-50"
      }
    >
      <span
        className={`mr-1 size-1.5 rounded-full ${
          isDone ? "bg-emerald-500" : isRejected ? "bg-gray-400" : "bg-orange-500"
        }`}
      />
      {label}
    </Badge>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const [activeTab, setActiveTab] = useState("posts");
  const [postToView, setPostToView] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
  });

  const { data: rawPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["admin", "posts"],
    queryFn: () => adminService.getPosts(),
  });

  const posts = useMemo(
    () => rawPosts.filter((p) => !p.deleted_at),
    [rawPosts],
  );

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminService.getUsers(),
  });

  const { data: claims = [], isLoading: loadingClaims } = useQuery({
    queryKey: ["admin", "claims"],
    queryFn: () => adminService.getClaims(),
  });

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
    if (!q) return posts;
    return posts.filter((p) => {
      const authorName = p.user?.name || p.author?.name || "";
      return (
        String(p.title || "").toLowerCase().includes(q) ||
        authorName.toLowerCase().includes(q) ||
        String(p.category || "").toLowerCase().includes(q)
      );
    });
  }, [posts, q]);

  const filteredUsers = useMemo(() => {
    if (!q) return users;
    return users.filter(
      (u) =>
        String(u.name || "").toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q) ||
        String(u.whatsapp || "").toLowerCase().includes(q),
    );
  }, [users, q]);

  const filteredClaims = useMemo(() => {
    if (!q) return claims;
    return claims.filter((c) => {
      const title = c.post?.title || c.item || "";
      const claimer = c.claimer?.name || c.claimant?.name || "";
      const owner = c.owner?.name || c.post?.user?.name || "";
      return (
        title.toLowerCase().includes(q) ||
        claimer.toLowerCase().includes(q) ||
        owner.toLowerCase().includes(q)
      );
    });
  }, [claims, q]);

  const lostCount = posts.filter(
    (p) => String(p.type || "").toLowerCase() !== "ditemukan",
  ).length;
  const foundCount = posts.filter(
    (p) => String(p.type || "").toLowerCase() === "ditemukan",
  ).length;
  const resolvedCount = posts.filter((p) =>
    ["selesai", "resolved"].includes(String(p.status || "").toLowerCase()),
  ).length;

  const statItems = [
    { label: "Total laporan", value: stats?.posts_total ?? posts.length, icon: Package },
    { label: "Kehilangan", value: stats?.posts_lost ?? lostCount, dot: "bg-orange-500" },
    { label: "Ditemukan", value: stats?.posts_found ?? foundCount, dot: "bg-blue-600" },
    { label: "Selesai", value: stats?.posts_resolved ?? resolvedCount, icon: CheckCircle2 },
    { label: "Pengguna terdaftar", value: stats?.users_total ?? users.length, icon: Users },
  ];

  const tabLabel = {
    posts: `Postingan (${filteredPosts.length})`,
    users: `Pengguna (${filteredUsers.length})`,
    claims: `Pengajuan Klaim (${filteredClaims.length})`,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau laporan yang masuk, pengguna kampus, dan pengajuan klaim.
        </p>
      </div>

      <section
        aria-label="Ringkasan statistik"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {statItems.map((item) => (
          <AdminStatCard key={item.label} {...item} />
        ))}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Ringkasan Data</h2>
          <p className="text-sm text-muted-foreground">
            Kelola data laporan, pengguna, dan pengajuan klaim.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-auto w-full justify-start gap-5 overflow-x-auto rounded-none border-b border-border bg-transparent p-0 shadow-none">
            {Object.entries(tabLabel).map(([value, label]) => {
              const isActive = activeTab === value;
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  style={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    color: isActive ? "#171717" : "#737373",
                    fontWeight: isActive ? 700 : 500,
                    borderBottom: isActive
                      ? "2px solid #171717"
                      : "2px solid transparent",
                    borderRadius: 0,
                  }}
                  className="flex-none rounded-none px-0 pb-3 pt-1 text-sm tabular-nums shadow-none"
                >
                  {label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
            <TabsContent value="posts" className="m-0">
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
                    {loadingPosts ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          Memuat postingan...
                        </TableCell>
                      </TableRow>
                    ) : filteredPosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          Belum ada postingan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPosts.map((post) => {
                        const firstImage = resolveMediaUrl(
                          Array.isArray(post.images) && post.images.length > 0
                            ? post.images[0]
                            : post.image,
                        );
                        return (
                          <TableRow key={post.id}>
                            <TableCell className="min-w-[220px]">
                              <div className="flex items-center gap-2.5">
                                <div className="size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                                  {firstImage ? (
                                    <img
                                      src={firstImage}
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
                                  onClick={() => setPostToView(normalizePost(post))}
                                  className="h-7 px-2.5 text-[11px]"
                                >
                                  <Eye className="mr-1 size-3" /> Lihat
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPostToDelete(post)}
                                  className="h-7 border-red-200 px-2.5 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="mr-1 size-3" /> Hapus
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="users" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/70">
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Postingan</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Memuat pengguna...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Belum ada pengguna.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => {
                        const postsCount =
                          u.posts_count ??
                          (Array.isArray(u.posts) ? u.posts.length : 0);
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
                              {u.whatsapp || u.phone || "-"}
                            </TableCell>
                            <TableCell className="tabular-nums">{postsCount}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {u.created_at ? formatDateId(u.created_at) : "-"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/profile/${u.id}`)}
                                className="h-7 px-2.5 text-[11px]"
                              >
                                <Eye className="mr-1 size-3" /> Lihat Profil
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="claims" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/70">
                      <TableHead>Barang</TableHead>
                      <TableHead>Pengklaim</TableHead>
                      <TableHead>Pelapor</TableHead>
                      <TableHead>Diajukan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingClaims ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Memuat pengajuan klaim...
                        </TableCell>
                      </TableRow>
                    ) : filteredClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Belum ada pengajuan klaim.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClaims.map((claim) => {
                        const post = claim.post ?? {};
                        const thumb = resolveMediaUrl(
                          post.images?.length > 0 ? post.images[0] : post.image,
                        );
                        return (
                          <TableRow key={claim.id}>
                            <TableCell className="min-w-[190px]">
                              <div className="flex items-center gap-2.5">
                                <div className="size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                                  {thumb ? (
                                    <img
                                      src={thumb}
                                      alt={post.title || "Barang"}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <div className="grid size-full place-items-center text-muted-foreground">
                                      <Package className="size-4" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium">
                                    {post.title || claim.item || "Barang"}
                                  </p>
                                  <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                                    {claim.message || "Pengajuan klaim"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {claim.claimer?.name || claim.claimant?.name || "-"}
                            </TableCell>
                            <TableCell>
                              {claim.owner?.name ||
                                post.user?.name ||
                                post.author?.name ||
                                "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {claim.created_at ? formatDateId(claim.created_at) : "-"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={claim.status} />
                            </TableCell>
                            <TableCell>
                              {post.id ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPostToView(normalizePost(post))}
                                  className="h-7 px-2.5 text-[11px]"
                                >
                                  <Eye className="mr-1 size-3" /> Lihat
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>

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
              &ldquo;{postToDelete?.title ?? ""}&rdquo;
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
