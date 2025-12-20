"use client";

import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Space, Table } from "antd";
import api from "@/lib/api";
import type { Category } from "@/types";
import { LiaraImageUpload } from "@/components/admin/LiaraImageUpload";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<Category[]>("/categories");
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, []);

  function handleNew() {
    setEditing(null);
    form.resetFields();
    form.setFieldValue("id", undefined);
    setImageFile(null);
    setOpen(true);
  }

  function handleEdit(record: Category) {
    setEditing(record);
    form.setFieldsValue(record);
    // Explicitly set id to ensure it's preserved
    if (record.id) {
      form.setFieldValue("id", record.id);
    }
    setImageFile(null);
    setOpen(true);
  }

  async function handleSubmit() {
    const values = await form.validateFields();
    // Remove id from values as it's only used for identification
    const { id, ...submitValues } = values;
    // Check form field first, then editing state as fallback
    const editingId = id || editing?.id;
    
    const formData = new FormData();
    Object.entries(submitValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    if (imageFile) {
      formData.append("image", imageFile);
    }
    
    if (editingId) {
      await api.put(`/categories/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    setOpen(false);
    form.resetFields();
    setEditing(null);
    setImageFile(null);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }

  async function handleDelete(record: Category) {
    if (!record.id) {
      console.error("Cannot delete: ID is undefined");
      return;
    }

    Modal.confirm({
      title: "حذف دسته",
      content: `آیا از حذف دسته "${record.titleFa}" اطمینان دارید؟`,
      okText: "بله، حذف کن",
      cancelText: "انصراف",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/categories/${record.id}`);
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          load();
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      },
    });
  }

  return (
    <div className="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">دسته‌ها</h1>
        <Button type="primary" onClick={handleNew} className="w-full sm:w-auto">
          دسته جدید
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          rowKey={(record) => record.id || `row-${record.titleFa}-${record.titleEn}`}
          loading={loading}
          dataSource={items}
          scroll={{ x: "max-content" }}
          columns={[
            { 
              title: "عنوان فارسی", 
              dataIndex: "titleFa",
              responsive: ["xs", "sm", "md", "lg"],
            },
            { 
              title: "عنوان انگلیسی", 
              dataIndex: "titleEn",
              responsive: ["sm", "md", "lg"],
            },
            {
              title: "عملیات",
              width: 150,
              render: (_value, record) => (
                <Space size="small" orientation="vertical" className="w-full sm:flex-row!">
                  <Button 
                    size="small" 
                    onClick={() => handleEdit(record)}
                    className="w-full sm:w-auto"
                  >
                    ویرایش
                  </Button>
                  <Button
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
        title={editing ? "ویرایش دسته" : "دسته جدید"}
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
          setEditing(null);
          setImageFile(null);
        }}
        onOk={handleSubmit}
        okText="ذخیره"
        cancelText="انصراف"
        width="90%"
        style={{ maxWidth: 600 }}
      >
        <Form layout="vertical" form={form} className="mt-3">
          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name="titleFa"
            label="عنوان فارسی"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="titleEn"
            label="عنوان انگلیسی"
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
          <Form.Item name="icon" label="تصویر">
            <LiaraImageUpload
              value={editing?.icon}
              onChange={(file) => setImageFile(file)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


