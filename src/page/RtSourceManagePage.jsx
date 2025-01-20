import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import MyContent from '../components/MyContent';
const { Header, Sider, Content } = Layout;
const RtSourceManagePage = () => {
const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
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