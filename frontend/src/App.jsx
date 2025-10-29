import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/login/LoginPage';
import SignupPage from './components/signup/SignupPage';
import InterviewerDashboard from './components/InterviewerDashboard';
import CandidateDashboard from './components/CandidateDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import JobDetailsPage from './components/JobDetailsPage';
import ApplicationReviewPage from './components/ApplicationReviewPage';
import ReviewerDashboard from "./components/ReviewerDashboard.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/reviewer-dashboard"
                    element={
                        <ProtectedRoute allowedUserTypes={['Reviewer']}>
                            <ReviewerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recruiter-dashboard"
                    element={
                    <ProtectedRoute allowedUserTypes={['Recruiter']}>
                        <RecruiterDashboard />
                    </ProtectedRoute>
                }
                />
                <Route
                    path="/interviewer-dashboard"
                    element={
                    <ProtectedRoute allowedUserTypes={['Interviewer']}>
                        <InterviewerDashboard />
                    </ProtectedRoute>
                }
                />
                <Route
                    path="/candidate-dashboard"
                    element={
                    <ProtectedRoute allowedUserTypes={['Candidate']}>
                        <CandidateDashboard />
                    </ProtectedRoute>
                }
                />
                <Route path="/jobs/:jobId" element={
                    <ProtectedRoute allowedRoles={['Recruiter']}>
                        <JobDetailsPage />
                    </ProtectedRoute>
                }
                />
                <Route path="/applications/:applicationId" element={
                    <ProtectedRoute allowedRoles={['Recruiter', 'Reviewer']}>
                        <ApplicationReviewPage />
                    </ProtectedRoute>
                }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;