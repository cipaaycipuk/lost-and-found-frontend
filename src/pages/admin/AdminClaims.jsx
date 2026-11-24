import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
import AdminNavbar from "@/components/AdminNavbar";

const initialClaims = [
  {
    id: 1,
    item: "Dompet Hitam",
    description: "Dompet kulit berwarna hitam",
    claimant: "Andi Pratama",
    reporter: "Nadia Putri",
    date: "2026-11-22T10:30:00",
    status: "Menunggu",
  },
  {
    id: 2,
    item: "Laptop ASUS",
    description: "Laptop ASUS VivoBook warna silver",
    claimant: "Rizky Ramadhan",
    reporter: "Dinda Safitri",
    date: "2026-11-21T14:15:00",
    status: "Disetujui",
  },
  {
    id: 3,
    item: "Tumbler Biru",
    description: "Tumbler biru berukuran 750 ml",
    claimant: "Fajar Maulana",
    reporter: "Salsa Amelia",
    date: "2026-11-20T09:45:00",
    status: "Ditolak",
  },
  {
    id: 4,
    item: "Kunci Motor",
    description: "Satu set kunci motor dengan gantungan",
    claimant: "Putri Maharani",
    reporter: "Dimas Saputra",
    date: "2026-11-19T13:20:00",
    status: "Menunggu",
  },
  {
    id: 5,
    item: "Headset Putih",
    description: "Headset wireless berwarna putih",
    claimant: "Aulia Rahma",
    reporter: "Kevin Wijaya",
    date: "2026-11-18T16:00:00",
    status: "Disetujui",
  },
];

export default function AdminClaims() {
  const [claims] = useState(initialClaims);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const filteredClaims = useMemo(() => {
    return claims
      .filter((claim) => {
        const keyword = search.toLowerCase();

        return (
          claim.item.toLowerCase().includes(keyword) ||
          claim.claimant.toLowerCase().includes(keyword) ||
          claim.reporter.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        return sortOrder === "newest"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      });
  }, [claims, search, sortOrder]);

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);

  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleView = (claim) => {
    alert(`Detail pengajuan klaim: ${claim.item}`);
  };

  const statusColors = {
    Menunggu: {
      bg: "#FCEEE3",
      text: "#FF5F00",
    },
    Disetujui: {
      bg: "#E4E8FF",
      text: "#001994",
    },
    Ditolak: {
      bg: "#EDEDED",
      text: "#515151",
    },
  };

  return (
    <>
      <div className="mx-10 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pengajuan Klaim
            <span className="ml-2 ">
              ({filteredClaims.length})
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola pengajuan klaim barang dari pengguna.
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari barang, pengklaim, atau pelapor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barang</TableHead>
                <TableHead>Pengklaim</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Waktu Pengajuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedClaims.length > 0 ? (
                paginatedClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {claim.item}
                        </p>
                        <p className="text-xs text-gray-500">
                          {claim.description}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>{claim.claimant}</TableCell>

                    <TableCell>{claim.reporter}</TableCell>

                    <TableCell className="text-sm text-gray-600">
                      {formatDate(claim.date)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: statusColors[claim.status].bg,
                          color: statusColors[claim.status].text,
                        }}
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(claim)}
                      >
                        Lihat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-gray-500"
                  >
                    Tidak ada pengajuan klaim ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-gray-500">
            Menampilkan {paginatedClaims.length} dari {filteredClaims.length}{" "}
            pengajuan klaim
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Sebelumnya
            </Button>

            <span className="text-sm text-gray-600">
              {currentPage} / {Math.max(totalPages, 1)}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
