import React, { useState } from 'react';
import { ConfigProvider, theme, Tabs, Switch, Space } from 'antd';
import Dashboard from './components/Dashboard';
import RiskAssessment from './components/RiskAssessment';

export default function App() {
  const [darkMode, setDarkMode]   = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // pass this into Dashboard so it can tell us when data changes
  const bumpRefresh = () => setRefreshKey(k => k + 1);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode
          ? theme.darkAlgorithm
          : theme.defaultAlgorithm
      }}
    >
      {/* theme toggle */}
      <Space
        style={{
          width: '100%',
          padding: 16,
          justifyContent: 'flex-end',
          background: darkMode ? '#141414' : '#fff'
        }}
      >
        <Switch
          checkedChildren="🌙 Dark"
          unCheckedChildren="☀️ Light"
          checked={darkMode}
          onChange={setDarkMode}
        />
      </Space>

      <Tabs defaultActiveKey="1" type="line" style={{ padding: 16 }}>
        <Tabs.TabPane tab="Dashboard" key="1">
          {/* give Dashboard a callback so it can notify us of changes */}
          <Dashboard onDataChange={bumpRefresh} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Risk Assessment" key="2">
          {/* using refreshKey as part of key forces a remount */}
          <RiskAssessment key={refreshKey} />
        </Tabs.TabPane>
      </Tabs>
    </ConfigProvider>
  );
}
