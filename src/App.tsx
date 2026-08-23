import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ReviewsPage from './pages/ReviewsPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminAppointmentsPage from './pages/admin/AppointmentsPage';
import AdminEnquiriesPage from './pages/admin/EnquiriesPage';
import AdminServicesPage from './pages/admin/ServicesPage';
import AdminGalleryPage from './pages/admin/GalleryPage';
import AdminReviewsPage from './pages/admin/ReviewsPage';
import AdminFaqsPage from './pages/admin/FaqsPage';
import AdminBusinessPage from './pages/admin/BusinessPage';
import AdminOpeningHoursPage from './pages/admin/OpeningHoursPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/book-appointment" element={<BookAppointmentPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="enquiries" element={<AdminEnquiriesPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="gallery" element={<AdminGalleryPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="faqs" element={<AdminFaqsPage />} />
        <Route path="business" element={<AdminBusinessPage />} />
        <Route path="opening-hours" element={<AdminOpeningHoursPage />} />
      </Route>
    </Routes>
  );
}
