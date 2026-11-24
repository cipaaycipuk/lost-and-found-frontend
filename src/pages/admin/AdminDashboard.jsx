import { useMemo, useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Users, Package, CheckCircle2, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function StatCard({ item }) {
  const Icon = item.icon;
  return (
    <Card className="min-w-0 border-0 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
          {item.dot ? (
            <span className={`size-1.5 rounded-full ${item.dot}`} />
          ) : null}
          {Icon ? <Icon className="size-3.5" /> : null}
          <span className="truncate">{item.label}</span>
        </div>
        <p className="text-xl font-semibold tracking-tight sm:text-2xl">
          {item.value}
        </p>
      </CardContent>
    </Card>
  );
}

function TypeBadge({ type }) {
  const isFound = String(type).toLowerCase() === "ditemukan";
  const label = isFound ? "Ditemukan" : "Kehilangan";

  return (
    <Badge
      className={
        isFound
          ? "border-0 bg-blue-100 text-blue-700 hover:bg-blue-100"
          : "border-0 bg-orange-100 text-orange-700 hover:bg-orange-100"
      }
    >
      {label}
    </Badge>
  );
}

function StatusBadge({ status }) {
  const done = ["selesai", "resolved", "diterima"].includes(
    String(status).toLowerCase(),
  );
  return (
    <Badge
      className={
        done
          ? "border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
          : "border-0 bg-orange-50 text-orange-700 hover:bg-orange-50"
      }
    >
      <span
        className={`mr-1 size-1.5 rounded-full ${done ? "bg-emerald-500" : "bg-orange-500"}`}
      />
      {status}
    </Badge>
  );
}

function ActionButtons({ deleteLabel = "Hapus", onView, onDelete }) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={onView}
        className="h-7 px-2.5 text-[11px]"
      >
        <Eye className="mr-1 size-3" /> Lihat
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="h-7 border-red-200 px-2.5 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="mr-1 size-3" /> {deleteLabel}
      </Button>
    </div>
  );
}

const API_BASE = "http://127.0.0.1:8000";

function resolveImageUrl(img) {
  if (!img) return null;

  // item bisa string atau object ({ url } / { path } / { image_path })
  const raw =
    typeof img === "string"
      ? img
      : (img.url ?? img.path ?? img.image_path ?? null);
  if (!raw) return null;

  // 1. URL penuh -> pakai langsung
  if (/^https?:\/\//i.test(raw)) return raw;

  // 2. path storage Laravel (/storage/...) -> prefix host backend
  if (raw.startsWith("/storage/")) return `${API_BASE}${raw}`;

  // 3. asset frontend (/posts-img/...) -> biarkan relatif
  if (raw.startsWith("/")) return raw;

  // 4. path polos (posts/xxx.png) -> storage Laravel
  return `${API_BASE}/storage/${raw}`;
}

// Ubah data mentah API admin ke bentuk yang dipakai PostCard (beranda user)
function toPostCardShape(post) {
  const rawImages =
    Array.isArray(post.images) && post.images.length > 0
      ? post.images
      : post.image
        ? [post.image]
        : [];
  const images = rawImages.map(resolveImageUrl).filter(Boolean);

  const author = post.author ?? post.user ?? {};
  const createdAt = post.created_at ? new Date(post.created_at) : null;

  return {
    ...post,
    type: String(post.type ?? "").toLowerCase(),
    status: String(post.status ?? "").toLowerCase(),
    image: images[0] ?? null,
    images,
    author: { ...author, avatar: resolveImageUrl(author.avatar) },
    timeAgo:
      post.timeAgo ??
      (createdAt
        ? createdAt.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : ""),
  };
}

function PostsTable({ posts, loading, onView, onDelete }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
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
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center">
              Memuat postingan...
            </TableCell>
          </TableRow>
        ) : posts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center">
              Belum ada postingan.
            </TableCell>
          </TableRow>
        ) : (
          posts.map((post) => {
            const firstImage = resolveImageUrl(
              Array.isArray(post.images) && post.images.length > 0
                ? post.images[0]
                : post.image,
            );

            return (
              <TableRow key={post.id}>
                <TableCell className="min-w-[220px]">
                  <div className="flex items-center gap-2.5">
                    <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
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
                      <p className="font-medium text-foreground">
                        {post.title}
                      </p>
                      <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {post.description || "-"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {post.user?.name || post.author?.name || "-"}
                </TableCell>

                <TableCell>
                  <TypeBadge type={post.type} />
                </TableCell>

                <TableCell>{post.category || "-"}</TableCell>

                <TableCell className="whitespace-nowrap">
                  {post.created_at
                    ? new Date(post.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </TableCell>

                <TableCell>
                  <StatusBadge status={post.status} />
                </TableCell>

                <TableCell>
                  <ActionButtons
                    onView={() => onView?.(post)}
                    onDelete={() => onDelete?.(post)}
                  />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

function UsersTable({ users, loading }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pengguna</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>WhatsApp</TableHead>
          <TableHead>Postingan</TableHead>
          <TableHead>Bergabung</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center">
              Memuat pengguna...
            </TableCell>
          </TableRow>
        ) : users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center">
              Belum ada pengguna.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => {
            const name = user.name || "Tanpa nama";
            const avatar =
              user.avatar || user.profile_picture || user.profile_photo || null;

            const initials = name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            const whatsapp =
              user.whatsapp || user.phone || user.phone_number || "-";

            const postsCount =
              user.posts_count ??
              (Array.isArray(user.posts) ? user.posts.length : null) ??
              (typeof user.posts === "number" ? user.posts : 0);

            const joined = user.created_at
              ? new Date(user.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-";

            return (
              <TableRow key={user.id}>
                <TableCell className="min-w-[150px]">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 shrink-0 overflow-hidden rounded-full bg-muted">
                      {avatar ? (
                        <img
                          src={resolveImageUrl(avatar)}
                          alt={`Foto profil ${name}`}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling.style.display =
                              "grid";
                          }}
                        />
                      ) : null}

                      <div
                        className="size-full place-items-center text-xs font-medium"
                        style={{ display: avatar ? "none" : "grid" }}
                      >
                        {initials}
                      </div>
                    </div>
                    <span className="font-medium">{name}</span>
                  </div>
                </TableCell>

                <TableCell>{user.email || "-"}</TableCell>

                <TableCell className="whitespace-nowrap">{whatsapp}</TableCell>

                <TableCell>{postsCount}</TableCell>

                <TableCell className="whitespace-nowrap">{joined}</TableCell>

                <TableCell>
                  <ActionButtons deleteLabel="Hapus" />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

function ClaimsTable({ claims, loading }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Barang</TableHead>
          <TableHead>Pengklaim</TableHead>
          <TableHead>Pelapor (sender)</TableHead>
          <TableHead>Diajukan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center">
              Memuat pengajuan klaim...
            </TableCell>
          </TableRow>
        ) : claims.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center">
              Belum ada pengajuan klaim.
            </TableCell>
          </TableRow>
        ) : (
          claims.map((claim) => {
            const post = claim.post ?? {};

            const item = post.title || claim.item || "Barang tidak diketahui";

            const type = String(post.type || "").toLowerCase();
            const detail = type
              ? `${type === "found" || type === "ditemukan" ? "Ditemukan" : "Kehilangan"} - ${claim.owner?.name || post.user?.name || "-"}`
              : "Pengajuan klaim";

            const claimant = claim.claimer?.name || claim.claimant?.name || "-";

            const reporter =
              claim.owner?.name || post.user?.name || post.author?.name || "-";

            const submitted = claim.created_at
              ? new Date(claim.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-";

            const statusLabels = {
              pending: "Menunggu",
              accepted: "Diterima",
              rejected: "Ditolak",
            };

            const status =
              statusLabels[String(claim.status).toLowerCase()] ||
              claim.status ||
              "-";

            return (
              <TableRow key={claim.id}>
                <TableCell className="min-w-[180px]">
                  <div className="flex items-center gap-2.5">
                    <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {post.image || post.images?.length > 0 ? (
                        <img
                          src={resolveImageUrl(
                            post.images?.length > 0
                              ? post.images[0]
                              : post.image,
                          )}
                          alt={item}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-muted-foreground">
                          <Package className="size-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="font-medium">{item}</p>
                      <p className="text-xs text-muted-foreground">{detail}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{claimant}</TableCell>

                <TableCell>{reporter}</TableCell>

                <TableCell className="whitespace-nowrap">{submitted}</TableCell>

                <TableCell>
                  <StatusBadge status={status} />
                </TableCell>

                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[11px]"
                  >
                    <Eye className="mr-1 size-3" /> Lihat
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("posts");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(true);

  const [postToView, setPostToView] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await adminService.getClaims();

        console.log("DATA PENGAJUAN KLAIM:", response);

        const claimData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.claims)
              ? response.claims
              : [];

        setClaims(claimData);
      } catch (error) {
        console.error("Gagal mengambil pengajuan klaim:", error);
      } finally {
        setLoadingClaims(false);
      }
    };

    fetchClaims();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminService.getUsers();

        console.log("DATA PENGGUNA:", response);

        const userData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.users)
              ? response.users
              : [];

        setUsers(userData);
      } catch (error) {
        console.error("Gagal mengambil pengguna:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!postToView) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPostToView(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [postToView]);

  const viewPost = postToView ? toPostCardShape(postToView) : null;

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    try {
      await adminService.deletePost(postToDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setPostToDelete(null);
    } catch (error) {
      console.error("Gagal menghapus postingan:", error);
      alert("Gagal menghapus postingan.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();

        console.log("RESPONSE STATS:", response);
        console.log("DATA STATS:", response.data);

        setStats(response?.data ?? response);
      } catch (error) {
        console.error("Gagal mengambil statistik:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await adminService.getPosts();

        console.log("DATA POSTINGAN:", response);

        setPosts(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Gagal mengambil postingan:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  const statItems = [
    {
      label: "Total laporan",
      value: stats?.posts_total ?? "-",
      icon: Package,
    },
    {
      label: "Kehilangan",
      value: stats?.posts_lost ?? "-",
      dot: "bg-orange-500",
    },
    {
      label: "Ditemukan",
      value: stats?.posts_found ?? "-",
      dot: "bg-blue-600",
    },
    {
      label: "Selesai",
      value: stats?.posts_resolved ?? "-",
      icon: CheckCircle2,
    },
    {
      label: "Pengguna terdaftar",
      value: stats?.users_total ?? "-",
      icon: Users,
    },
  ];

  const tabLabel = useMemo(
    () => ({
      posts: `Postingan (${posts.length})`,
      users: `Pengguna (${users.length})`,
      claims: `Pengajuan Klaim (${claims.length})`,
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#171717]">
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[1600px] flex-col md:flex-row">
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard Admin
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pantau laporan yang masuk dan hapus postingan atau user yang tidak
              pantas.
            </p>
          </div>

          <section
            aria-label="Ringkasan statistik"
            className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            {loadingStats ? (
              <p className="col-span-full text-sm text-muted-foreground">
                Memuat statistik...
              </p>
            ) : (
              statItems.map((item) => <StatCard key={item.label} item={item} />)
            )}
          </section>

          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Preview</h2>
                <p className="text-sm text-muted-foreground">
                  Kelola data laporan, pengguna, dan pengajuan klaim.
                </p>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="h-auto w-full justify-start gap-5 rounded-none border-b border-border bg-transparent p-0 shadow-none">
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
                        fontWeight: isActive ? 700 : 400,
                        borderBottom: isActive
                          ? "2px solid #171717"
                          : "2px solid transparent",
                        borderRadius: 0,
                      }}
                      className="flex-none rounded-none px-0 pb-3 pt-1 text-sm shadow-none"
                    >
                      {label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <div className="mt-3 overflow-hidden rounded-xl border bg-white shadow-sm">
                <TabsContent value="posts" className="m-0">
                  <div className="overflow-x-auto">
                    <PostsTable
                      posts={posts}
                      loading={loadingPosts}
                      onView={setPostToView}
                      onDelete={setPostToDelete}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="users" className="m-0">
                  <div className="overflow-x-auto">
                    <UsersTable users={users} loading={loadingUsers} />
                  </div>
                </TabsContent>
                <TabsContent value="claims" className="m-0">
                  <div className="overflow-x-auto">
                    <ClaimsTable claims={claims} loading={loadingClaims} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </main>
      </div>

      <ConfirmDialog
        open={Boolean(postToDelete)}
        title="Hapus postingan ini?"
        description={`Postingan "${postToDelete?.title ?? ""}" akan dihapus dari platform.`}
        confirmLabel="Ya, Hapus"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPostToDelete(null)}
      />

      {postToView && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60"
          onClick={() => setPostToView(null)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="w-full max-w-xl space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <PostCard post={viewPost} readOnly />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={() => setPostToView(null)}
                >
                  Tutup
                </Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    setPostToDelete(postToView);
                    setPostToView(null);
                  }}
                >
                  <Trash2 className="mr-1 size-3.5" /> Hapus
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
