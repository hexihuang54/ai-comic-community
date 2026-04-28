import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePage from './pages/CreatePage';
import MangaViewerPage from './pages/MangaViewerPage';
import SharedMangaPage from './pages/SharedMangaPage';
import MangaUpdatePage from './pages/MangaUpdatePage';
import ProfilePage from './pages/ProfilePage';
import AdminAuditPage from './pages/AdminAuditPage';
import CreatorEarningsPage from './pages/CreatorEarningsPage';
import ChallengePage from './pages/ChallengePage';
import AuthGuard from './components/AuthGuard';
import GuestGuard from './components/GuestGuard';
import AdminGuard from './components/AdminGuard';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#e74c3c',
          borderRadius: 8,
        },
      }}
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/manga/:id" element={<MangaViewerPage />} />
          <Route path="/manga/:id/update" element={<MangaUpdatePage />} />
          <Route path="/share/:id" element={<SharedMangaPage />} />
          <Route
            path="/login"
            element={
              <GuestGuard>
                <LoginPage />
              </GuestGuard>
            }
          />
          <Route
            path="/register"
            element={
              <GuestGuard>
                <RegisterPage />
              </GuestGuard>
            }
          />
          <Route
            path="/create"
            element={
              <AuthGuard>
                <CreatePage />
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          />
          <Route
            path="/creator/earnings"
            element={
              <AuthGuard>
                <CreatorEarningsPage />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <AdminGuard>
                <AdminAuditPage />
              </AdminGuard>
            }
          />
          <Route path="/challenge" element={<ChallengePage />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App;
