import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ScrollToTop from './utills/ScrollToTop';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { PageLoader } from './components/Loader';
import ProtectedRoute from './components/ProtectedRoute';
import ApiTestPage from './pages/ApiTest';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Plants = lazy(() => import('./pages/Plants'));
const Plant = lazy(() => import('./pages/Plant'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail'));
const AddCaseStudy = lazy(() => import('./pages/AddCaseStudy'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManagePlants = lazy(() => import('./pages/admin/ManagePlants'));
const ManageCaseStudies = lazy(() => import('./pages/admin/ManageCaseStudies'));
const ManageImages = lazy(() => import('./pages/admin/ManageImages'));
const ManageFeedback = lazy(() => import('./pages/admin/ManageFeedback'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));

// 404 Page
const NotFound = () => (
  <div className="not-found-page">
    <div className="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  </div>
);

function App() {
  const { loading } = useAuth();

  // Show loader while checking auth
  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="app">
      <Navbar />
      
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <ScrollToTop />
          <Routes>
            <Route path="/api-test" element={<ApiTestPage />} />
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/plant/:slug" element={<Plant />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/feedback" element={<Feedback />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected User Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bookmarks" 
              element={
                <ProtectedRoute>
                  <Bookmarks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/case-studies/add" 
              element={
                <ProtectedRoute>
                  <AddCaseStudy />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/plants" 
              element={
                <ProtectedRoute adminOnly>
                  <ManagePlants />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/case-studies" 
              element={
                <ProtectedRoute adminOnly>
                  <ManageCaseStudies />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/images" 
              element={
                <ProtectedRoute adminOnly>
                  <ManageImages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/feedback" 
              element={
                <ProtectedRoute adminOnly>
                  <ManageFeedback />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute adminOnly>
                  <ManageUsers />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect /admin to dashboard */}
            <Route 
              path="/admin" 
              element={<Navigate to="/admin/dashboard" replace />} 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;