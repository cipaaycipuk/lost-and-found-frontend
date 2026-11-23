
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

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
import AdminNavbar from "@/components/AdminNavbar";

// Mock data sementara, mengikuti data di Dashboard
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

export default function AdminUsers() {
  const [sortOrder, setSortOrder] = useState("Terbaru");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const itemsPerPage = 7;

  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.whatsapp.toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });

    if (sortOrder === "Terlama") {
      result = [...result].reverse();
    }

    return result;
  }, [sortOrder, search]);

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
    <div className="space-y-5">
      <AdminNavbar />

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
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="min-w-[150px]">
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                            {user.initials}
                          </div>

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
