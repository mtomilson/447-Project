import React from 'react'
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export function ProtectedRoute({ role } : {role?: string}) {
    const { user } = useAuth();
    if(!user) return <Navigate to="/"/> // not logged in, redirect to login
    // this user's role does not allow access
    if(role && role !== user[0].role) return <Navigate to="/"/> // ** needs to be changed it currently reroutes to login page

    return <Outlet/>

}
