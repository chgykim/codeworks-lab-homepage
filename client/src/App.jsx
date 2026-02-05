import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { AuthProvider } from './hooks/useAuth';

// Public pages
import Home from './pages/Home';
import Manual from './pages/Manual';
import Reviews from './pages/Reviews';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User pages
import MyPage from './pages/user/MyPage';
import ChangePassword from './pages/user/ChangePassword';
import MyReviews from './pages/user/MyReviews';
import MyInquiries from './pages/user/MyInquiries';

// Admin pages
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ManageReviews from './pages/admin/ManageReviews';
import ManageApps from './pages/admin/ManageApps';

function App() {
    const { i18n } = useTranslation();
    const [langKey, setLangKey] = useState(i18n.language);

    // Force re-mount of entire app when language changes
    useEffect(() => {
        const handleLanguageChange = (lng) => {
            setLangKey(lng);
        };

        i18n.on('languageChanged', handleLanguageChange);
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

    return (
        <AuthProvider key={langKey}>
            <Router>
                <Header />
                <main>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/manual" element={<Manual />} />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />

                        {/* Auth routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* User routes */}
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/mypage/password" element={<ChangePassword />} />
                        <Route path="/mypage/reviews" element={<MyReviews />} />
                        <Route path="/mypage/inquiries" element={<MyInquiries />} />

                        {/* Admin routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<Dashboard />} />
                        <Route path="/admin/reviews" element={<ManageReviews />} />
                        <Route path="/admin/apps" element={<ManageApps />} />
                    </Routes>
                </main>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;
