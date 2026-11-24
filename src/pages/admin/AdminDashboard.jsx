import { useMemo, useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Users, Package, CheckCircle2, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const users = [
  {
    id: 1,
    initials: "SR",
    name: "Salsa R.",
    email: "salsa.r@widyatama.ac.id",
    whatsapp: "0812 xxxx 1042",
    posts: 3,
    joined: "4 Nov 2026",
  },
  {
    id: 2,
    initials: "DA",
    name: "Dimas A.",
    email: "dimas.a@widyatama.ac.id",
    whatsapp: "0813 xxxx 2210",
    posts: 5,
    joined: "2 Nov 2026",
  },
  {
    id: 3,
    initials: "AB",
    name: "Akun Baru",
    email: "akunbaru77@widyatama.ac.id",
    whatsapp: "0857 xxxx 9031",
    posts: 4,
    joined: "2 Nov 2026",
  },
  {
    id: 4,
    initials: "RP",
    name: "Raka P.",
    email: "raka.p@widyatama.ac.id",
    whatsapp: "0821 xxxx 7765",
    posts: 2,
    joined: "30 Okt 2026",
  },
  {
    id: 5,
    initials: "NF",
    name: "Nadia F.",
    email: "nadia.f@widyatama.ac.id",
    whatsapp: "0878 xxxx 3318",
    posts: 1,
    joined: "28 Okt 2026",
  },
];

const claims = [
  {
    id: 1,
    item: "Handphone",
    detail: "Kehilangan - Salsa R.",
    claimant: "Rayyanza Cipung",
    reporter: "Salsa R.",
    submitted: "5 menit yang lalu",
    status: "Menunggu",
  },
  {
    id: 2,
    item: "Dompet kulit hitam",
    detail: "Ditemukan - Nadia F.",
    claimant: "Nadial Fadhil",
    reporter: "Nadia F.",
    submitted: "42 menit yang lalu",
    status: "Menunggu",
  },
  {
    id: 3,
    item: "Kunci motor Honda",
    detail: "Kehilangan - Raka P.",
    claimant: "Dimas Prasetyo",
    reporter: "Raka P.",
    submitted: "2 jam yang lalu",
    status: "Diterima",
  },
  {
    id: 4,
    item: "Dompet kulit hitam",
    detail: "Ditemukan - Nadia F.",
    claimant: "Nadial Fadhil",
    reporter: "Nadia F.",
    submitted: "42 menit yang lalu",
    status: "Menunggu",
  },
  {
    id: 5,
    item: "Kunci motor Honda",
    detail: "Kehilangan - Raka P.",
    claimant: "Dimas Prasetyo",
    reporter: "Raka P.",
    submitted: "2 jam yang lalu",
    status: "Diterima",
  },
];

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

function ActionButtons({ deleteLabel = "Hapus" }) {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px]">
        <Eye className="mr-1 size-3" /> Lihat
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 border-red-200 px-2.5 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="mr-1 size-3" /> {deleteLabel}
      </Button>
    </div>
  );
}

function PostsTable({ posts, loading }) {
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
          posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="min-w-[220px]">
                <div className="flex items-center gap-2.5">
                  <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {post.image ? (
                      <img
                        src={`http://127.0.0.1:8000/storage${post.image}`}
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
                <ActionButtons />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function UsersTable() {
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
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="min-w-[150px]">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
                  {user.initials}
                </div>
                <span className="font-medium">{user.name}</span>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="whitespace-nowrap">{user.whatsapp}</TableCell>
            <TableCell>{user.posts}</TableCell>
            <TableCell className="whitespace-nowrap">{user.joined}</TableCell>
            <TableCell>
              <ActionButtons deleteLabel="Hapus akun" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ClaimsTable() {
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
        {claims.map((claim) => (
          <TableRow key={claim.id}>
            <TableCell className="min-w-[180px]">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Package className="size-4" />
                </div>
                <div>
                  <p className="font-medium">{claim.item}</p>
                  <p className="text-xs text-muted-foreground">
                    {claim.detail}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>{claim.claimant}</TableCell>
            <TableCell>{claim.reporter}</TableCell>
            <TableCell className="whitespace-nowrap">
              {claim.submitted}
            </TableCell>
            <TableCell>
              <StatusBadge status={claim.status} />
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
        ))}
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
      posts: "Postingan (123)",
      users: "Pengguna (54)",
      claims: "Pengajuan Klaim (67)",
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
                    <PostsTable posts={posts} loading={loadingPosts} />
                  </div>
                </TabsContent>
                <TabsContent value="users" className="m-0">
                  <div className="overflow-x-auto">
                    <UsersTable />
                  </div>
                </TabsContent>
                <TabsContent value="claims" className="m-0">
                  <div className="overflow-x-auto">
                    <ClaimsTable />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </main>
      </div>
    </div>
  );
}
