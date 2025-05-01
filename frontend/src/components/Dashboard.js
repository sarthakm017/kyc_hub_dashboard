import React, { useEffect, useState, useRef } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Spin,
  Button,
  Modal,
  Popconfirm,
  message,
  Empty,
  Input,
  Space,
  theme,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import KycForm from "./KycForm";
import api from "../services/api";

const { Content } = Layout;
const COLORS = ["#1890ff", "#ff4d4f", "#52c41a", "#faad14"];

export default function Dashboard({ onDataChange }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [trendData, setTrendData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const { token } = theme.useToken();

  const fetchAll = () => {
    setLoading(true);
    return Promise.all([
      api.get("/dashboard/metrics"),
      api.get("/dashboard/trends"),
      api.get("/dashboard/risk-distribution"),
      api.get("/kyc"),
    ])
      .then(([m, t, r, c]) => {
        console.log(m, "sarthak");
        if (m.data.success) setMetrics(m.data.data);
        if (t.data.success) setTrendData(t.data.data);
        if (r.data.success) setRiskData(r.data.data);
        if (c.data.success) setCustomers(c.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/kyc/${id}`);
      message.success("Entry deleted");
      await fetchAll();
      onDataChange?.();
    } catch {
      message.error("Delete failed");
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{ color: filtered ? token.colorPrimary : undefined }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: token.colorHighlight, padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  const filtered = customers;

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      ...getColumnSearchProps("fullName"),
    },
    {
      title: "ID #",
      dataIndex: "idNumber",
      key: "idNumber",
      ...getColumnSearchProps("idNumber"),
    },
    {
      title: "Risk Score",
      dataIndex: "riskScore",
      key: "riskScore",
      filters: [
        { text: "Low (<40)", value: "low" },
        { text: "Medium (40–69)", value: "medium" },
        { text: "High (70+)", value: "high" },
      ],
      onFilter: (value, record) => {
        if (value === "low") return record.riskScore < 40;
        if (value === "medium")
          return record.riskScore >= 40 && record.riskScore < 70;
        if (value === "high") return record.riskScore >= 70;
        return false;
      },
      render: (val) => <Progress percent={val} size="small" />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Approved", value: "Approved" },
        { text: "Review", value: "Review" },
        { text: "Rejected", value: "Rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete this entry?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading) return <Spin style={{ margin: 50 }} />;

  return (
    <Layout style={{ minHeight: "100vh", background: token.colorBgLayout }}>
      <Content
        style={{
          margin: token.margin,
          padding: token.padding,
          background: token.colorBgContainer,
        }}
      >
        <Row justify="end" style={{ marginBottom: token.margin }}>
          <Button type="primary" onClick={() => setModalVisible(true)}>
            Add KYC
          </Button>
        </Row>

        <Modal
          title="New KYC Entry"
          open={isModalVisible}
          footer={null}
          onCancel={() => setModalVisible(false)}
          destroyOnClose
        >
          <KycForm
            existingIds={customers.map((c) => c.idNumber)}
            onSuccess={() => {
              setModalVisible(false);
              fetchAll();
              onDataChange?.();
            }}
          />
        </Modal>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Total Customers"
                value={metrics.totalCustomers}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Avg. Risk Score"
                value={metrics.avgRiskScore}
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: token.margin }}>
          <Col span={12}>
            <Card title="Income vs Expenses">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" stroke={token.colorText} />
                  <YAxis stroke={token.colorText} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Income" />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#ff4d4f"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Risk Score Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="count"
                    nameKey="range"
                    innerRadius={60}
                    outerRadius={100}
                    label={{ fill: token.colorText }}
                  >
                    {riskData.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row style={{ marginTop: token.margin }}>
          <Col span={24}>
            <Card title="Customer Data">
              {filtered.length ? (
                <Table dataSource={filtered} columns={columns} rowKey="_id" />
              ) : (
                <Empty
                  description="No KYC records"
                  style={{ padding: "2rem 0" }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
