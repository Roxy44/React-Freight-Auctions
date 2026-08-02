import type { PropsWithChildren } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App as AntApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';

import { queryClient } from '@/shared/api/query-client';

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider
                locale={ruRU}
                theme={{
                    token: {
                        colorPrimary: '#0f6e56',
                        borderRadius: 8,
                    },
                }}
            >
                <AntApp>{children}</AntApp>
            </ConfigProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
