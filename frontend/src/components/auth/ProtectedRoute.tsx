import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ProtectedRouteProps } from "../../types";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    user,
    redirect = "/login",
}) => {
    if (!user) return <Navigate to={redirect} />;

    return children ? children : <Outlet />;
};

export default ProtectedRoute;