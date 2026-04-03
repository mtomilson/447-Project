import React from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./navbar/index";

export function Layout() {
  const { pathname } = useLocation();
  return pathname !== "/" ? <Navbar /> : null;
}
