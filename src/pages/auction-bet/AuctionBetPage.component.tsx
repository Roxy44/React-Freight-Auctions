import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Card, Form, InputNumber, Space, Typography } from 'antd';
import { App } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';

import { useAuctionDetailQuery, usePlaceBetMutation } from '@/entities/auction/api/auction-queries';
import { buildBetSchema, type BetFormValues } from '@/entities/auction/lib/bet-schema';
import { formatMoney } from '@/entities/auction/lib/format';
import { ValidationApiError, ApiError } from '@/shared/api/errors';
import { QueryState } from '@/shared/ui/QueryState.component';

export function AuctionBetPage() {
    const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' });
    const navigate = useNavigate();
    const { message } = App.useApp();
    const detailQuery = useAuctionDetailQuery(auctionUuid);
    const mutation = usePlaceBetMutation(auctionUuid);

    const pricing = detailQuery.data?.pricing;
    const schema = useMemo(
        () => buildBetSchema(pricing?.min, pricing?.max, pricing?.step),
        [pricing?.min, pricing?.max, pricing?.step],
    );

    const form = useForm<BetFormValues>({
        resolver: zodResolver(schema),
        values: {
            price: pricing?.available_price ?? pricing?.current_price ?? pricing?.min ?? 0,
        },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            await mutation.mutateAsync(values);
            message.success('Ставка принята');
            void navigate({ to: '/auctions/$auctionUuid', params: { auctionUuid } });
        } catch (error) {
            if (error instanceof ValidationApiError) {
                for (const item of error.errors) {
                    if (item.field === 'price') {
                        form.setError('price', { message: item.message });
                    }
                }
                message.error(error.message || 'Ошибка валидации');
                return;
            }
            if (error instanceof ApiError) {
                message.error(error.message);
                return;
            }
            message.error('Не удалось отправить ставку');
        }
    });

    const canSetBet = detailQuery.data?.trading.can_set_bet === true;
    const errorMessage =
        detailQuery.error instanceof ApiError ? detailQuery.error.message : 'Не удалось загрузить аукцион';

    return (
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
            <div>
                <Typography.Title level={2} style={{ marginBottom: 4 }}>
                    {detailQuery.data?.my_bet.has_bet ? 'Изменить ставку' : 'Сделать ставку'}
                </Typography.Title>
                <Typography.Text type='secondary'>
                    {detailQuery.data ? `Заявка ${detailQuery.data.cargo_num}` : auctionUuid}
                </Typography.Text>
            </div>

            <QueryState
                isLoading={detailQuery.isLoading}
                isError={detailQuery.isError}
                errorMessage={errorMessage}
                onRetry={() => void detailQuery.refetch()}
            >
                {!canSetBet ? (
                    <Alert
                        type='warning'
                        showIcon
                        message='Ставка недоступна'
                        description='trading.can_set_bet = false для этого аукциона.'
                        action={
                            <Link to='/auctions/$auctionUuid' params={{ auctionUuid }}>
                                <Button>К аукциону</Button>
                            </Link>
                        }
                    />
                ) : (
                    <Card>
                        <Alert
                            type='info'
                            showIcon
                            style={{ marginBottom: 16 }}
                            message='Подсказка по цене'
                            description={`Доступная цена: ${formatMoney(pricing?.available_price)}. Шаг: ${formatMoney(pricing?.step)}. Диапазон: ${formatMoney(pricing?.min)} — ${formatMoney(pricing?.max)}.`}
                        />

                        <Form layout='vertical' onFinish={() => void onSubmit()}>
                            <Form.Item
                                label='Цена ставки'
                                required
                                validateStatus={form.formState.errors.price ? 'error' : undefined}
                                help={form.formState.errors.price?.message}
                            >
                                <Controller
                                    name='price'
                                    control={form.control}
                                    render={({ field }) => (
                                        <InputNumber
                                            {...field}
                                            style={{ width: '100%', maxWidth: 320 }}
                                            min={0}
                                            step={pricing?.step || 1}
                                            onChange={(value) => field.onChange(value ?? undefined)}
                                        />
                                    )}
                                />
                            </Form.Item>

                            <Space>
                                <Button type='primary' htmlType='submit' loading={mutation.isPending}>
                                    Отправить ставку
                                </Button>
                                <Link to='/auctions/$auctionUuid' params={{ auctionUuid }}>
                                    <Button>Отмена</Button>
                                </Link>
                            </Space>
                        </Form>
                    </Card>
                )}
            </QueryState>
        </Space>
    );
}
