import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './components/login/LoginPage';
import SignupPage from './components/signup/SignupPage';
import InterviewerDashboard from './components/InterviewerDashboard';
import CandidateDashboard from './components/CandidateDashboard';
import RecruiterDashboard from './components/recruiter/RecruiterDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import JobDetailsPage from './components/recruiter/JobDetailsPage';
import ApplicationReviewPage from './components/recruiter/ApplicationReviewPage';
import ReviewerDashboard from "./components/ReviewerDashboard.jsx";
import JobsPage from './components/recruiter/JobsPage';
import CandidatesPage from './components/recruiter/CandidatesPage';
import InterviewDetailsPage from "./components/InterviewDetailsPage.jsx";
import DocumentManagementPage from "./components/DocumentManagementPage.jsx";
import HRDashboard from "./components/HRDashboard.jsx";
import ReportsDashboard from "./components/recruiter/ReportsDashboard.jsx";
import Footer from './components/common/Footer';

import PrivacyPolicy from './components/common/PrivacyPolicy';
import TermsOfService from './components/common/TermsOfService';
import HelpCenter from './components/common/HelpCenter';

const AppLayout = () => {
    const location = useLocation();

    const publicPaths = ['/login', '/signup', '/', '/privacy', '/terms', '/help'];

    const noFooterPaths = ['/privacy', '/terms', '/help'];

    const isPublicPage = publicPaths.some(path =>
        location.pathname === path || location.pathname === path + '/'
    );

    const showFooter = !noFooterPaths.some(path =>
        location.pathname === path || location.pathname === path + '/'
    );

    return (
        <>
            <div className="app-content" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <Routes>
                    {/* --- Public Routes --- */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/help" element={<HelpCenter />} />

                    {/* --- Protected Routes --- */}
                    <Route path="/candidate-dashboard" element={
                        <ProtectedRoute allowedUserTypes={['Candidate']}> <CandidateDashboard /> </ProtectedRoute>
                    } />
                    <Route path="/interviewer-dashboard" element={
                        <ProtectedRoute allowedUserTypes={['Interviewer', 'Technical Interviewer']}> <InterviewerDashboard /> </ProtectedRoute>
                    } />
                    <Route path="/recruiter-dashboard" element={
                        <ProtectedRoute allowedUserTypes={['Recruiter', 'Admin']}> <RecruiterDashboard /> </ProtectedRoute>
                    } />
                    <Route path="/reviewer-dashboard" element={
                        <ProtectedRoute allowedUserTypes={['Reviewer']}> <ReviewerDashboard /> </ProtectedRoute>
                    } />
                    <Route path="/hr-dashboard" element={
                        <ProtectedRoute allowedUserTypes={['HR', 'Recruiter']}> <HRDashboard /> </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                        <ProtectedRoute allowedUserTypes={['Recruiter', 'Admin']}> <ReportsDashboard /> </ProtectedRoute>
                    } />

                    {/* Recruiter & Shared Routes */}
                    <Route path="/recruiter/jobs" element={
                        <ProtectedRoute allowedRoles={['Recruiter']}> <JobsPage /> </ProtectedRoute>
                    } />
                    <Route path="/recruiter/candidates" element={
                        <ProtectedRoute allowedRoles={['Recruiter']}> <CandidatesPage /> </ProtectedRoute>
                    } />
                    <Route path="/jobs/:jobId" element={
                        <ProtectedRoute allowedRoles={['Recruiter']}> <JobDetailsPage /> </ProtectedRoute>
                    } />
                    <Route path="/applications/:applicationId" element={
                        <ProtectedRoute allowedRoles={['Recruiter', 'Reviewer']}> <ApplicationReviewPage /> </ProtectedRoute>
                    } />
                    <Route path="/interviews/:interviewId" element={
                        <ProtectedRoute allowedRoles={['Interviewer', 'Recruiter']}> <InterviewDetailsPage /> </ProtectedRoute>
                    } />
                    <Route path="/applications/:applicationId/documents" element={
                        <ProtectedRoute allowedRoles={['Recruiter', 'HR', 'Candidate']}>
                            <DocumentManagementPage />
                        </ProtectedRoute>
                    } />

                    {/* --- Fallback Route --- */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>

            {showFooter && (
                <div style={{
                    marginLeft: isPublicPage ? '0' : '260px',
                    width: isPublicPage ? '100%' : 'calc(100% - 260px)',
                    transition: 'margin-left 0.3s ease, width 0.3s ease'
                }}>
                    <Footer />
                </div>
            )}
        </>
    );
};

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;