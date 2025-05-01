import React, { useEffect, useState } from "react";
import { Table, Progress, Tag, Spin, message } from "antd";
import api from "../services/api";

function computeRiskScore(c) {
  const cs = c.creditScore || 0;
  const creditRisk = ((850 - cs) / 550) * 100;

  const history = Array.isArray(c.loanRepaymentHistory)
    ? c.loanRepaymentHistory
    : [];
  const missed = history.filter((x) => x === 0).length;
  const repaymentRisk = history.length ? (missed / history.length) * 100 : 0;

  const income = c.monthlyIncome || 0;
  const annualIncome = income * 12 || 1;
  const loanRisk = Math.min(
    ((c.outstandingLoans || 0) / annualIncome) * 100,
    100
  );

  return Math.round(creditRisk * 0.4 + repaymentRisk * 0.3 + loanRisk * 0.3);
}

function riskTag(score) {
  if (score >= 70) return <Tag color="error">High ({score})</Tag>;
  if (score >= 40) return <Tag color="warning">Medium ({score})</Tag>;
  return <Tag color="success">Low ({score})</Tag>;
}

export default function RiskAssessment() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/kyc")
      .then((res) => {
        if (res.data.success) {
          setData(
            res.data.data.map((c, i) => ({
              key: i,
              ...c,
            }))
          );
        } else {
          message.error("Failed to load data");
        }
      })
      .catch(() => message.error("API error"))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: "Customer", dataIndex: "fullName", key: "fullName" },
    { title: "Credit Score", dataIndex: "creditScore", key: "creditScore" },
    {
      title: "Missed Payments",
      key: "missed",
      render: (_, rec) =>
        Array.isArray(rec.loanRepaymentHistory)
          ? rec.loanRepaymentHistory.filter((x) => x === 0).length
          : 0,
    },
    {
      title: "Loan / Annual Income",
      key: "ratio",
      render: (_, rec) => {
        const mi = rec.monthlyIncome || 0;
        const pct = mi
          ? Math.min(
              ((rec.outstandingLoans || 0) / (mi * 12)) * 100,
              100
            ).toFixed(1)
          : "0.0";
        return `${pct}%`;
      },
    },
    {
      title: "Risk Score",
      key: "riskScore",
      render: (_, rec) => {
        const score = computeRiskScore(rec);
        return (
          <>
            <Progress percent={score} size="small" />
            {riskTag(score)}
          </>
        );
      },
    },
  ];

  if (loading) return <Spin style={{ margin: 50 }} />;

  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={false}
      style={{ margin: "24px" }}
    />
  );
}

export { computeRiskScore };
