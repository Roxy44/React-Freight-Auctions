import { Alert, Button, Empty, Skeleton, Space } from 'antd';
import type { ReactNode } from 'react';

type QueryStateProps = {
    isLoading: boolean;
    isError: boolean;
    isEmpty?: boolean;
    errorMessage?: string;
    emptyDescription?: string;
    onRetry?: () => void;
    skeleton?: ReactNode;
    children: ReactNode;
};

export function QueryState({
    isLoading,
    isError,
    isEmpty = false,
    errorMessage = 'Не удалось загрузить данные',
    emptyDescription = 'Ничего не найдено',
    onRetry,
    skeleton,
    children,
}: QueryStateProps) {
    if (isLoading) {
        return (
            skeleton ?? (
                <Space direction='vertical' style={{ width: '100%' }} size='middle'>
                    <Skeleton active paragraph={{ rows: 3 }} />
                    <Skeleton active paragraph={{ rows: 3 }} />
                </Space>
            )
        );
    }

    if (isError) {
        return (
            <Alert
                type='error'
                showIcon
                message='Ошибка'
                description={errorMessage}
                action={
                    onRetry ? (
                        <Button size='small' onClick={onRetry}>
                            Повторить
                        </Button>
                    ) : undefined
                }
            />
        );
    }

    if (isEmpty) {
        return <Empty description={emptyDescription} />;
    }

    return children;
}
