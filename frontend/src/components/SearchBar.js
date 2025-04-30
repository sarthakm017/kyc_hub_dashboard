 import React from 'react';
import { Row, Col, Input } from 'antd';

export default function SearchBar({ value, onChange }) {
  return (
    <Row style={{ marginBottom: 16 }}>
      <Col span={12}>
        <Input.Search
          placeholder="Search by name or ID"
          allowClear
          enterButton
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: 300 }}
        />
      </Col>
    </Row>
  );
}
