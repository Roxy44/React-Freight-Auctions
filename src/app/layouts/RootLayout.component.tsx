import { Layout, Typography } from 'antd';
import { Link, Outlet } from '@tanstack/react-router';

import { DEFAULT_AUCTIONS_SEARCH } from '@/entities/auction/lib/search-params';
import { APP_NAME } from '@/shared/config/env';
import { AppLogo } from '@/shared/ui/AppLogo.component';

import styles from './RootLayout.module.css';

const { Header, Content, Footer } = Layout;

export function RootLayout() {
    return (
        <Layout className={styles.layout}>
            <Header className={styles.header}>
                <Link to='/' search={DEFAULT_AUCTIONS_SEARCH} className={styles.brandLink}>
                    <AppLogo size={32} />
                    <Typography.Title level={4} className={styles.brand}>
                        {APP_NAME}
                    </Typography.Title>
                </Link>
            </Header>
            <Content className={styles.content}>
                <Outlet />
            </Content>
            <Footer className={styles.footer}>Грузовые аукционы · тестовое SPA</Footer>
        </Layout>
    );
}
