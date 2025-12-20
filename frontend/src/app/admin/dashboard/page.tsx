"use client";

import { Button, Card, Row, Col } from "antd";
import { AppstoreOutlined, ShoppingOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="rtl">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">خلاصه وضعیت</h1>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={12}>
          <Card
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            bordered={false}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <AppstoreOutlined className="text-4xl md:text-5xl text-blue-500" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">مدیریت دسته‌ها</h2>
              <p className="text-sm text-gray-600 mb-4">
                افزودن، ویرایش و حذف دسته‌های محصولات
              </p>
              <Link href="/admin/categories">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  className="w-full md:w-auto"
                >
                  مدیریت دسته‌ها
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={12}>
          <Card
            className="h-full shadow-md hover:shadow-lg transition-shadow"
            bordered={false}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <ShoppingOutlined className="text-4xl md:text-5xl text-green-500" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">مدیریت محصولات</h2>
              <p className="text-sm text-gray-600 mb-4">
                افزودن، ویرایش و حذف محصولات
              </p>
              <Link href="/admin/products">
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  className="w-full md:w-auto"
                >
                  مدیریت محصولات
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Card className="shadow-md" bordered={false}>
        <p className="text-sm md:text-base text-gray-600 mb-0">
          از منوی کناری یا دکمه‌های بالا می‌توانید دسته‌ها و محصولات را مدیریت کنید.
        </p>
      </Card>
    </div>
  );
}


