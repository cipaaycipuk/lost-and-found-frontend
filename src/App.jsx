import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import FormLaporan from "./pages/FormLaporan";
import PostDetailPage from "./pages/PostDetailPage";
import ErrorPage from "./pages/ErrorPage";
import DefaultLayout from "./components/DefaultLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminClaims from "./pages/admin/AdminClaims";
import AdminLayout from "./components/layouts/AdminLayout";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <DefaultLayout>
              <Home />
            </DefaultLayout>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route
          path="/posts/:postId"
          element={
            <DefaultLayout>
              <PostDetailPage />
            </DefaultLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <DefaultLayout>
              <Profile />
            </DefaultLayout>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <DefaultLayout>
              <Profile />
            </DefaultLayout>
          }
        />
        <Route
          path="/buat-laporan"
          element={
            <DefaultLayout>
              <FormLaporan />
            </DefaultLayout>
          }
        />
        <Route
          path="/edit-laporan/:postId"
          element={
            <DefaultLayout>
              <FormLaporan />
            </DefaultLayout>
          }
        />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="claims" element={<AdminClaims />} />
        </Route>
        
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/posts" element={<AdminPosts />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/claims" element={<AdminClaims />} /> */}

        <Route path="/403" element={<ErrorPage code={403} />} />
        <Route path="/500" element={<ErrorPage code={500} />} />
        <Route path="*" element={<ErrorPage code={404} />} />
      </Routes>
    </>
  );
}
