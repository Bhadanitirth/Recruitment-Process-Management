import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/login/LoginPage';
import SignupPage from './components/signup/SignupPage';
import InterviewerDashboard from './components/InterviewerDashboard';
import CandidateDashboard from './components/CandidateDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import JobDetailsPage from './components/JobDetailsPage';
import ApplicationReviewPage from './components/ApplicationReviewPage';
import ReviewerDashboard from "./components/ReviewerDashboard.jsx";
import InterviewDetailsPage from "./components/InterviewDetailsPage.jsx";
import DocumentManagementPage from "./components/DocumentManagementPage.jsx";
import HRDashboard from "./components/HRDashboard.jsx";

function App() {
    return (
        <Router>
            <Routes>
                {/* --- Public Routes --- */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* --- Protected Routes --- */}
                <Route path="/candidate-dashboard" element={
                    <ProtectedRoute allowedRoles={['Candidate']}> <CandidateDashboard /> </ProtectedRoute>
                } />
                <Route path="/interviewer-dashboard" element={
                    <ProtectedRoute allowedRoles={['Interviewer']}> <InterviewerDashboard /> </ProtectedRoute>
                } />
                <Route path="/reviewer-dashboard" element={
                    <ProtectedRoute allowedRoles={['Reviewer']}> <ReviewerDashboard /> </ProtectedRoute>
                } />
                <Route path="/recruiter-dashboard" element={
                    <ProtectedRoute allowedRoles={['Recruiter']}> <RecruiterDashboard /> </ProtectedRoute>
                } />
                <Route path="/hr-dashboard" element={
                    <ProtectedRoute allowedRoles={['HR', 'Recruiter']}> <HRDashboard /> </ProtectedRoute>
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
        </Router>
    );
}

export default App;

