"use client";

import { useState, useEffect } from "react";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";

interface LiaraImageUploadProps {
  value?: string;
  onChange?: (file: File | null) => void;
  fieldName?: string;
}

export function LiaraImageUpload({
  value,
  onChange,
  fieldName = "image",
}: LiaraImageUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (value && typeof value === "string" && (value.startsWith("http") || value.startsWith("/"))) {
      // If value is a URL (existing image), show it as preview
      setFileList([
        {
          uid: "-1",
          name: "image",
          status: "done",
          url: value,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [value]);

  const handleChange: UploadProps["onChange"] = (info) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      onChange?.(file || null);
    } else {
      onChange?.(null);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    onChange?.(null);
  };

  return (
    <Upload
      beforeUpload={() => false}
      fileList={fileList}
      onChange={handleChange}
      onRemove={handleRemove}
      listType="picture-card"
      maxCount={1}
      accept="image/*"
    >
      {fileList.length === 0 && (
        <div>
          <UploadOutlined />
          <div style={{ marginTop: 8 }}>انتخاب تصویر</div>
        </div>
      )}
    </Upload>
  );
}
