import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import FormLaporan from './pages/FormLaporan'
import DefaultLayout from './components/DefaultLayout'

export default function App() {
  return (
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
