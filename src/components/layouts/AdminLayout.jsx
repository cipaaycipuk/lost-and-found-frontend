
import { Outlet } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen">
      <AdminNavbar />

      <div className="flex flex-col md:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
