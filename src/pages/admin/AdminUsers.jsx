
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { adminService } from "@/services/adminService";

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

function resolveImageUrl(image) {
  if (!image) return null;

  const raw =
    typeof image === "string"
      ? image
      : image.url || image.path || image.image_path || null;

  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/storage/")) return `${API_BASE}${raw}`;
  if (raw.startsWith("/")) return raw;

  return `${API_BASE}/storage/${raw}`;
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState("Terbaru");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const itemsPerPage = 7;

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await adminService.getUsers();

        console.log("DATA ADMIN USERS:", response);

        const userData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.users)
              ? response.users
              : [];

        const formattedUsers = userData.map((user) => {
          const name = user.name || "-";

          const postsCount =
            user.posts_count ??
            (Array.isArray(user.posts) ? user.posts.length : null) ??
            (typeof user.posts === "number" ? user.posts : 0);

          return {
            id: user.id,
            name,
            initials: name
              .split(" ")
              .filter(Boolean)
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            email: user.email || "-",
            whatsapp:
              user.whatsapp ||
              user.phone ||
              user.phone_number ||
              "-",
            posts: postsCount,
            joined: user.created_at
              ? new Date(user.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-",
            avatar: resolveImageUrl(
              user.avatar || user.profile_picture || user.profile_photo
            ),
            createdAt: user.created_at
              ? new Date(user.created_at).getTime()
              : 0,
          };
        });

        setUsers(formattedUsers);
      } catch (error) {
        console.error("Gagal mengambil data pengguna:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search and sorting
  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    let result = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.whatsapp.toLowerCase().includes(keyword);

      return matchesSearch;
    });

    result = [...result].sort((a, b) => {
      return sortOrder === "Terbaru"
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt;
    });

    return result;
  }, [users, sortOrder, search]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage)
  );

  const currentUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const startItem =
    filteredUsers.length === 0 ? 0 : (page - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    page * itemsPerPage,
    filteredUsers.length
  );

  return (
    <div className="space-y-5 mt-8">
      {/* Page Heading */}
      <div className="mx-10">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">
            Pengguna ({filteredUsers.length})
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau pengguna yang terdaftar dan kelola akun yang tidak
            pantas.
          </p>
        </div>

        {/* Sorting and Search */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Sorting */}
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border bg-white px-3 text-sm"
          >
            <option value="Terbaru">Terbaru</option>
            <option value="Terlama">Terlama</option>
          </select>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari pengguna..."
              className="h-9 bg-white pl-9"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Memuat data pengguna...
                    </TableCell>
                  </TableRow>
                ) : currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="min-w-[150px]">
                        <div className="flex items-center gap-2.5">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="size-8 shrink-0 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                              {user.initials || "?"}
                            </div>
                          )}

                          <span className="font-medium">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>{user.email}</TableCell>

                      <TableCell className="whitespace-nowrap">
                        {user.whatsapp}
                      </TableCell>

                      <TableCell>{user.posts}</TableCell>

                      <TableCell className="whitespace-nowrap">
                        {user.joined}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs"
                            onClick={() =>
                              alert(`Detail pengguna: ${user.name}`)
                            }
                          >
                            Lihat
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() =>
                              alert(`Hapus akun: ${user.name}`)
                            }
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
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Tidak ada pengguna yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Menampilkan {startItem}-{endItem} dari{" "}
              {filteredUsers.length} pengguna
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
