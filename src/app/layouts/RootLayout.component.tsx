import { Layout, Typography } from 'antd';
import { Outlet } from '@tanstack/react-router';

import { APP_NAME } from '@/shared/config/env';

import styles from './RootLayout.module.css';

const { Header, Content, Footer } = Layout;

export function RootLayout() {
    return (
        <Layout className={styles.layout}>
            <Header className={styles.header}>
                <Typography.Title level={4} className={styles.brand}>
                    {APP_NAME}
                </Typography.Title>
            </Header>
            <Content className={styles.content}>
                <Outlet />
            </Content>
            <Footer className={styles.footer}>Грузовые аукционы · тестовое SPA</Footer>
        </Layout>
    );
}
