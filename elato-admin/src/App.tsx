import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LoginPage } from "./features/auth/LoginPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { AnalyticsPage } from "./features/analytics/AnalyticsPage";
import { CategoriesPage } from "./features/categories/CategoriesPage";
import { MenuPage } from "./features/menu/MenuPage";
import { SpecialsPage } from "./features/specials/SpecialsPage";
import { EventsPage } from "./features/events/EventsPage";
import { StayPage } from "./features/stay/StayPage";
import { GalleryPage } from "./features/gallery/GalleryPage";
import { HomepagePage } from "./features/homepage/HomepagePage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { MediaLibraryPage } from "./features/media/MediaLibraryPage";
import { UsersPage } from "./features/users/UsersPage";
import { NotFoundPage } from "./features/misc/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/specials" element={<SpecialsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/stay" element={<StayPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/homepage" element={<HomepagePage />} />
          <Route path="/media" element={<MediaLibraryPage />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={["owner", "admin"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["owner", "admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
