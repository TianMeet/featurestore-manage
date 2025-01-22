import React from 'react';

import { Layout, theme } from 'antd';
import MyContent from '../components/MyContent';
const { Header} = Layout;
const RtSourceManagePage = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Layout>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            textAlign: 'center',
            fontSize:"24px"
          }}
        >
            实时数据源管理
        </Header>
        <MyContent/>
      </Layout>
    </Layout>
  );
};
export default RtSourceManagePage;