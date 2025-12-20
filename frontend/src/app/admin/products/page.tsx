"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Row,
  Col,
} from "antd";
import api from "@/lib/api";
import type { Category, Product } from "@/types";
import { LiaraImageUpload } from "@/components/admin/LiaraImageUpload";

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const price = Form.useWatch("price", form);
  const discount = Form.useWatch("discount", form);

  async function load() {
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        api.get<{ items: Product[] }>("/products", {
          params: { page: 1, limit: 100 },
        }),
        api.get<Category[]>("/categories"),
      ]);
      setItems(prodsRes.data.items);
      setCategories(catsRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, []);

  useEffect(() => {
    if (open) {
      if (editing) {
        // Use setTimeout to ensure form is ready after modal opens
        setTimeout(() => {
          const categoryId = typeof editing.category === "string"
            ? editing.category
            : editing.category?.id;
          form.setFieldsValue({
            titleFa: editing.titleFa,
            titleEn: editing.titleEn,
            descFa: editing.descFa,
            descEn: editing.descEn,
            category: categoryId,
            price: editing.price,
            discount: editing.discount,
            orderingShowInList: editing.orderingShowInList,
            special: editing.special,
            status: editing.status,
          });
        }, 0);
      } else {
        form.resetFields();
      }
    }
  }, [open, editing, form]);

  function handleNew() {
    setEditing(null);
    form.resetFields();
    setImageFile(null);
    setOpen(true);
  }

  function handleEdit(record: Product) {
    setEditing(record);
    setImageFile(null);
    setOpen(true);
  }

  async function handleSubmit() {
    const values = await form.validateFields();
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (editing) {
      await api.put(`/products/${editing.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    setOpen(false);
    setImageFile(null);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }

  async function handleDelete(record: Product) {
    if (!record.id) {
      console.error("Cannot delete: ID is undefined");
      return;
    }

    Modal.confirm({
      title: "حذف محصول",
      content: `آیا از حذف محصول "${record.titleFa}" اطمینان دارید؟`,
      okText: "بله، حذف کن",
      cancelText: "انصراف",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/products/${record.id}`);
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          load();
        } catch (error) {
          console.error("Error deleting product:", error);
        }
      },
    });
  }

  return (
    <div className="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">محصولات</h1>
        <Button type="primary" onClick={handleNew} className="w-full sm:w-auto">
          محصول جدید
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={items}
          scroll={{ x: "max-content" }}
          columns={[
            { 
              title: "نام فارسی", 
              dataIndex: "titleFa",
              responsive: ["xs", "sm", "md", "lg"],
            },
            { 
              title: "نام انگلیسی", 
              dataIndex: "titleEn",
              responsive: ["sm", "md", "lg"],
            },
            {
              title: "دسته",
              responsive: ["md", "lg"],
              render: (_value, record) =>
                typeof record.category === "string"
                  ? record.category
                  : record.category?.titleFa,
            },
            { 
              title: "قیمت", 
              dataIndex: "price",
              responsive: ["sm", "md", "lg"],
              render: (price: number) => price?.toLocaleString("fa-IR") || "-",
            },
            {
              title: "ویژه",
              dataIndex: "special",
              responsive: ["md", "lg"],
              render: (v: boolean) => (v ? "بله" : "خیر"),
            },
            {
              title: "وضعیت",
              dataIndex: "status",
              responsive: ["sm", "md", "lg"],
              render: (v: string) => (v === "active" ? "فعال" : "غیرفعال"),
            },
            {
              title: "عملیات",
              width: 150,
              render: (_value, record) => (
                <Space size="small" vertical className="w-full sm:flex-row!">
                  <Button 
                    key="edit" 
                    size="small" 
                    onClick={() => handleEdit(record)}
                    className="w-full sm:w-auto"
                  >
                    ویرایش
                  </Button>
                  <Button
                    key="delete"
                    size="small"
                    danger
                    onClick={() => handleDelete(record)}
                    className="w-full sm:w-auto"
                  >
                    حذف
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={editing ? "ویرایش محصول" : "محصول جدید"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setImageFile(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        okText="ذخیره"
        cancelText="انصراف"
        destroyOnHidden
        width="90%"
        style={{ maxWidth: 700 }}
        styles={{
          body: { paddingTop: 24 }
        }}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="titleFa"
            label="نام فارسی"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="titleEn"
            label="نام انگلیسی"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="descFa" label="توضیحات فارسی">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="descEn" label="توضیحات انگلیسی">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="category"
            label="دسته"
            rules={[{ required: true, message: "لطفا دسته را انتخاب کنید" }]}
          >
            <Select
              placeholder="انتخاب دسته"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={categories.map((c) => ({
                label: c.titleFa,
                value: c.id,
              }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="price"
                label="قیمت (تومان)"
                rules={[{ required: true }]}
              >
                <InputNumber 
                  className="w-full" 
                  style={{ width: '100%' }}
                  controls={false}
                  parser={(value) => {
                    if (!value) return '';
                    return value.replace(/[^\d]/g, '');
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab' && e.key !== 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  formatter={(value?: string | number) => {
                    if (!value) return '';
                    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="discount" label="تخفیف (%)">
                <InputNumber 
                  className="w-full" 
                  min={0} 
                  max={100}
                  controls={false}
                  parser={(value) => {
                    if (!value) return '';
                    return value.replace(/[^\d]/g, '');
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab' && e.key !== 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  formatter={(value?: string | number) => {
                    if (!value) return '';
                    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          {price && (
            <Form.Item label="قیمت نهایی">
              <div className="text-lg font-semibold text-blue-600">
                {discount && discount > 0
                  ? Math.round(price * (1 - discount / 100)).toLocaleString("fa-IR")
                  : Math.round(price).toLocaleString("fa-IR")}{" "}
                تومان
                {discount && discount > 0 && (
                  <span className="text-sm text-gray-500 mr-2">
                    (قیمت اصلی: {Math.round(price).toLocaleString("fa-IR")} تومان)
                  </span>
                )}
              </div>
            </Form.Item>
          )}
          <Form.Item name="orderingShowInList" label="ترتیب نمایش">
            <InputNumber 
              className="w-full" 
              min={0}
              controls={false}
              parser={(value) => {
                if (!value) return '';
                return value.replace(/[^\d]/g, '');
              }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab' && e.key !== 'Enter') {
                  e.preventDefault();
                }
              }}
              formatter={(value?: string | number) => {
                if (!value) return '';
                return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              }}
            />
          </Form.Item>
          <Form.Item
            name="special"
            label="ویژه (نمایش در صفحه اصلی)"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="status"
            label="وضعیت"
            initialValue="active"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "فعال", value: "active" },
                { label: "غیرفعال", value: "inactive" },
              ]}
            />
          </Form.Item>
          <Form.Item name="image" label="تصویر">
            <LiaraImageUpload
              value={editing?.image}
              onChange={(file) => setImageFile(file)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


