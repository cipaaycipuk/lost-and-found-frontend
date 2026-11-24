
import { useMemo, useState, useEffect } from "react";
import { Search, Image as ImageIcon } from "lucide-react";

import { adminService } from "@/services/adminService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE = "http://127.0.0.1:8000";

function resolveImageUrl(img) {
  if (!img) return null;

  const raw =
    typeof img === "string"
      ? img
      : img.url ?? img.path ?? img.image_path ?? null;

  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) return raw;

  if (raw.startsWith("/storage/")) return `${API_BASE}${raw}`;

  if (raw.startsWith("/")) return raw;

  return `${API_BASE}/storage/${raw}`;
}

function TypeBadge({ type }) {
  const isFound =
    String(type).toLowerCase() === "ditemukan" ||
    String(type).toLowerCase() === "found";

  return (
    <Badge
      className={
        isFound
          ? "border-0 bg-blue-100 text-blue-700 hover:bg-blue-100"
          : "border-0 bg-orange-100 text-orange-700 hover:bg-orange-100"
      }
    >
      {type}
    </Badge>
  );
}

function StatusBadge({ status }) {
  const done = ["selesai", "resolved", "completed"].includes(
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
      {status}
    </Badge>
  );
}

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [sortOrder, setSortOrder] = useState("Terbaru");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const itemsPerPage = 7;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await adminService.getPosts();

        console.log("DATA ADMIN POSTS:", response);

        const postData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.posts)
              ? response.posts
              : [];

        const formattedPosts = postData.map((post) => {
          const rawImages =
            Array.isArray(post.images) && post.images.length > 0
              ? post.images
              : post.image
                ? [post.image]
                : [];

          const images = rawImages.map(resolveImageUrl).filter(Boolean);

          const typeLabels = {
            lost: "Kehilangan",
            found: "Ditemukan",
            kehilangan: "Kehilangan",
            ditemukan: "Ditemukan",
          };

          const statusLabels = {
            open: "Open",
            active: "Open",
            resolved: "Selesai",
            completed: "Selesai",
            selesai: "Selesai",
          };

          const createdAt = post.created_at
            ? new Date(post.created_at)
            : null;

          return {
            ...post,
            title: post.title || "Tanpa judul",
            description: post.description || "-",
            reporter:
              post.user?.name || post.author?.name || "-",
            type:
              typeLabels[String(post.type).toLowerCase()] ||
              post.type ||
              "-",
            category: post.category || "-",
            date: createdAt
              ? createdAt.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-",
            status:
              statusLabels[String(post.status).toLowerCase()] ||
              post.status ||
              "-",
            image: images[0] || null,
          };
        });

        setPosts(formattedPosts);
      } catch (error) {
        console.error("Gagal mengambil postingan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let result = posts.filter((post) => {
      const matchesType =
        typeFilter === "Semua" || post.type === typeFilter;

      const matchesStatus =
        statusFilter === "Semua" || post.status === statusFilter;

      const matchesCategory =
        categoryFilter === "Semua" || post.category === categoryFilter;

      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.reporter.toLowerCase().includes(search.toLowerCase());

      return (
        matchesType &&
        matchesStatus &&
        matchesCategory &&
        matchesSearch
      );
    });

    if (sortOrder === "Terlama") {
      result = [...result].reverse();
    }

    return result;
  }, [posts, typeFilter, statusFilter, categoryFilter, sortOrder, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / itemsPerPage),
  );

  const currentPosts = filteredPosts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const startItem =
    filteredPosts.length === 0 ? 0 : (page - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    page * itemsPerPage,
    filteredPosts.length,
  );

  return (
    <div className="space-y-15 mt-8">
      <div className="mx-10">
        {/* Page Heading */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">
            Postingan ({filteredPosts.length})
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau laporan yang masuk dan hapus postingan yang tidak pantas.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex rounded-lg border bg-white p-1">
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
                      ? "bg-black/85 shadow-sm text-white"
                      : "text-muted-foreground hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border bg-white px-3 text-sm"
            >
              <option value="Semua">Semua status</option>
              <option value="Open">Open</option>
              <option value="Selesai">Selesai</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border bg-white px-3 text-sm"
            >
              <option value="Semua">Semua kategori</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Dompet">Dompet</option>
              <option value="Kunci">Kunci</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            {/* Sorting */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-9 rounded-lg border bg-white px-3 text-sm"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terlama">Terlama</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative w-full xl:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari postingan..."
              className="h-9 bg-white pl-9"
            />
          </div>
        </div>

        {/* Posts Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Memuat postingan...
                    </TableCell>
                  </TableRow>
                ) : currentPosts.length > 0 ? (
                  currentPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="min-w-[230px]">
                        <div className="flex items-center gap-2.5">
                          <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                            {post.image ? (
                              <img
                                src={post.image}
                                alt={post.title}
                                className="size-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.nextElementSibling.style.display = "grid";
                                }}
                              />
                            ) : null}

                            <div
                              className="size-full place-items-center text-muted-foreground"
                              style={{
                                display: post.image ? "none" : "grid",
                              }}
                            >
                              <ImageIcon className="size-4" />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-foreground">
                              {post.title}
                            </p>
                            <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                              {post.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{post.reporter}</TableCell>

                      <TableCell>
                        <TypeBadge type={post.type} />
                      </TableCell>

                      <TableCell>{post.category}</TableCell>

                      <TableCell className="whitespace-nowrap">
                        {post.date}
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
                            onClick={() => alert(`Detail: ${post.title}`)}
                          >
                            Lihat
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => alert(`Hapus: ${post.title}`)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Tidak ada postingan yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Menampilkan {startItem}-{endItem} dari {filteredPosts.length}{" "}
              postingan
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Sebelumnya
              </Button>

              <span className="px-3 text-sm font-medium">
                {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
