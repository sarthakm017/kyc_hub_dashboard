import React, { useState } from "react";
import { Form, Input, DatePicker, InputNumber, Button } from "antd";
import api from "../services/api";

export default function KycForm({ existingIds = [], onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const repaymentHistory = values.loanRepaymentHistory
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => n === 0 || n === 1);

      const payload = {
        fullName: values.fullName,
        dob: values.dob.format("YYYY-MM-DD"),
        idNumber: values.idNumber,
        selfieUrl: values.selfieUrl,
        creditScore: values.creditScore,
        monthlyIncome: values.monthlyIncome,
        outstandingLoans: values.outstandingLoans,
        loanRepaymentHistory: repaymentHistory,
        income: values.income || 0,
        expenses: values.expenses || 0,
      };

      const res = await api.post("/kyc", payload);
      if (res.data.success) {
        form.resetFields();
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="dob" label="Date of Birth" rules={[{ required: true }]}>
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="idNumber"
        label="ID Number"
        rules={[
          { required: true },
          () => ({
            validator(_, value) {
              if (!value || !existingIds.includes(value)) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("This ID Number already exists"));
            },
          }),
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="selfieUrl"
        label="Selfie URL"
        rules={[{ required: true, type: "url" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="creditScore"
        label="Credit Score (300–850)"
        rules={[{ required: true, type: "number", min: 300, max: 850 }]}
      >
        <InputNumber min={300} max={850} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="monthlyIncome"
        label="Monthly Income"
        rules={[{ required: true, type: "number", min: 0 }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="outstandingLoans"
        label="Outstanding Loans"
        rules={[{ required: true, type: "number", min: 0 }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="loanRepaymentHistory"
        label="Repayment History (comma-sep 1=paid,0=missed)"
        rules={[
          { required: true },
          {
            validator: (_, v) => {
              const arr = v.split(",").map((s) => s.trim());
              if (arr.every((x) => x === "0" || x === "1"))
                return Promise.resolve();
              return Promise.reject(
                new Error("Enter only 0 or 1 separated by commas")
              );
            },
          },
        ]}
      >
        <Input placeholder="e.g. 1,0,1,1,0,1" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit KYC
        </Button>
      </Form.Item>
    </Form>
  );
}
