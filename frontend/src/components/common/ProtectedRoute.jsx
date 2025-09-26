import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedUserTypes }) => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
        // Redirect to appropriate dashboard based on user type
        switch (userType) {
            case 'Recruiter':
                return <Navigate to="/recruiter-dashboard" replace />;
            case 'Interviewer':
                return <Navigate to="/interviewer-dashboard" replace />;
            case 'Candidate':
                return <Navigate to="/candidate-dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;