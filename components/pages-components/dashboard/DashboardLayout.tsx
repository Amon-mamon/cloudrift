"use client";

import Header from "@/components/common/Header/Header";
import Sidebar from "@/components/common/Sidebar/Sidebar";
import { useState } from "react";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Header />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main content shifts based on sidebar width */}
      <main
        className={`transition-all duration-300 ease-in-out pt-18.25 ${
          collapsed ? "ml-15" : "ml-56"
        }`}
      >
        {children}
      </main>
    </>
  );
}