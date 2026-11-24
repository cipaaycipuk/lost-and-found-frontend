import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

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

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // Fetch claims from backend
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);

        const response = await adminService.getClaims();

        console.log("DATA ADMIN CLAIMS:", response);

        const claimData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.claims)
              ? response.claims
              : Array.isArray(response?.data?.data)
                ? response.data.data
                : [];

        const formattedClaims = claimData.map((claim) => {
          const post = claim.post || claim.item_report || claim.report || {};

          const claimant = claim.claimer || claim.user || claim.claimant || {};

          const reporter =
            post.user || post.author || claim.owner || claim.reporter || {};

          const rawStatus = (claim.status || "pending").toLowerCase();

          let status = "Menunggu";

          if (["accepted", "approved", "disetujui"].includes(rawStatus)) {
            status = "Disetujui";
          } else if (["rejected", "declined", "ditolak"].includes(rawStatus)) {
            status = "Ditolak";
          }

          // Get item images
          const rawImages =
            post.images || post.image || post.photos || claim.images || [];

          const images = Array.isArray(rawImages) ? rawImages : [rawImages];

          return {
            id: claim.id,
            item:
              post.title ||
              post.name ||
              claim.item_name ||
              claim.item ||
              "Barang tidak diketahui",
            description: post.description || claim.description || "-",
            claimant: claimant.name || claim.claimant_name || "-",
            reporter: reporter.name || claim.reporter_name || "-",
            date: claim.created_at || claim.createdAt || claim.date || null,
            status,
            rawStatus,
            image: resolveImageUrl(images[0]),
          };
        });

        setClaims(formattedClaims);
      } catch (error) {
        console.error("Gagal mengambil data klaim:", error);
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // Search and sorting
  const filteredClaims = useMemo(() => {
    const keyword = search.toLowerCase();

    return [...claims]
      .filter((claim) => {
        return (
          claim.item.toLowerCase().includes(keyword) ||
          claim.claimant.toLowerCase().includes(keyword) ||
          claim.reporter.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;

        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [claims, search, sortOrder]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredClaims.length / itemsPerPage),
  );

  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleString("id-ID", {
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
            <span className="ml-2">({filteredClaims.length})</span>
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
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-white overflow-x-auto">
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-gray-500"
                  >
                    Memuat data pengajuan klaim...
                  </TableCell>
                </TableRow>
              ) : paginatedClaims.length > 0 ? (
                paginatedClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {claim.image ? (
                          <img
                            src={claim.image}
                            alt={claim.item}
                            className="size-12 shrink-0 rounded-lg object-cover border"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="size-12 shrink-0 rounded-lg bg-gray-100 border" />
                        )}

                        <div>
                          <p className="font-medium text-gray-900">
                            {claim.item}
                          </p>
                          <p className="text-xs text-gray-500">
                            {claim.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{claim.claimant}</TableCell>

                    <TableCell>{claim.reporter}</TableCell>

                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">
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
              {currentPage} / {totalPages}
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
