import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedUserTypes }) => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If allowedUserTypes is strictly defined, check permissions
    if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
        switch (userType) {
            case 'Admin':
                return <Navigate to="/admin-dashboard" replace />;
            case 'Recruiter':
                return <Navigate to="/recruiter-dashboard" replace />;
            case 'Interviewer':
            case 'Technical Interviewer':
                return <Navigate to="/interviewer-dashboard" replace />;
            case 'Candidate':
                return <Navigate to="/candidate-dashboard" replace />;
            case 'Reviewer':
                return <Navigate to="/reviewer-dashboard" replace />;
            case 'HR':
                return <Navigate to="/hr-dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;