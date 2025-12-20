"use client";

import { ConfigProvider, Layout, Menu, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import faIR from "antd/locale/fa_IR";
import { ReactNode, useEffect, useState } from "react";
import api from "@/lib/api";

const { Header, Sider, Content } = Layout;

const items = [
  { key: "/admin/dashboard", label: <Link href="/admin/dashboard">داشبورد</Link> },
  { key: "/admin/categories", label: <Link href="/admin/categories">دسته‌ها</Link> },
  { key: "/admin/products", label: <Link href="/admin/products">محصولات</Link> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  
  // Auto-collapse sidebar on mobile on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "fa");
  }, []);

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === "/admin/login") {
      setIsAuthenticated(true);
      return;
    }

    async function checkAuth() {
      // Check if token exists
      const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
      
      if (!token) {
        router.push("/admin/login");
        return;
      }

      // Verify token with backend
      try {
        await api.get("/auth/admin/verify");
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("token");
        }
        router.push("/admin/login");
      }
    }

    checkAuth();
  }, [pathname, router]);

  // Show nothing while checking authentication
  if (isAuthenticated === null && pathname !== "/admin/login") {
    return null;
  }

  // For login page, render without the layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <ConfigProvider locale={faIR} direction="rtl">
      <Layout style={{ minHeight: "100vh" }}>
        {/* Overlay for mobile */}
        {!collapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-200 lg:hidden"
            onClick={() => setCollapsed(true)}
          />
        )}
        
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={250}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 201,
          }}
          className="fixed!"
        >
          <div className="h-16 flex items-center justify-center text-white font-bold text-lg">
            مینا کافه
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            items={items}
            onClick={() => {
              // Close sidebar on mobile when item is clicked
              if (window.innerWidth < 992) {
                setCollapsed(true);
              }
            }}
          />
        </Sider>
        <Layout
          style={{
            marginRight: collapsed ? 0 : 250,
            transition: "margin-right 0.2s",
          }}
          className="lg:mr-[250px]!"
        >
          <Header
            className="flex items-center justify-between px-3 md:px-6 shadow-sm border-b border-gray-100"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              width: "100%",
              backgroundColor: "#fafbfc",
              background: "linear-gradient(to left, #ffffff 0%, #f8f9fa 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="lg:hidden hover:bg-gray-100"
                style={{ color: "#4a5568" }}
              />
              <span className="font-semibold text-sm md:text-base text-gray-700">پنل مدیریت</span>
            </div>
            <Button
              type="text"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem("token");
                }
                router.push("/admin/login");
              }}
              className="text-xs md:text-sm hover:bg-gray-100"
              style={{ color: "#4a5568" }}
            >
              خروج
            </Button>
          </Header>
          <Content className="p-3 md:p-6 bg-[#f5f5f5] min-h-[calc(100vh-64px)]">
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}


