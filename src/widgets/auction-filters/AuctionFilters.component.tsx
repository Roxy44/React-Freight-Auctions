import { Button, Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Select, Space, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

import { AUCTION_STATUS_LABELS, AUCTION_TYPE_LABELS } from '@/entities/auction/lib/labels';
import { resolveSelectedStatuses, type AuctionsSearchParams } from '@/entities/auction/lib/search-params';
import { CITIES } from '@/shared/config/cities';
import { useUiStore } from '@/shared/model/ui-store';

import styles from './AuctionFilters.module.css';

type AuctionFiltersProps = {
    value: AuctionsSearchParams;
    onApply: (next: Partial<AuctionsSearchParams>) => void;
    onReset: () => void;
};

/** Tri-state for nullable boolean filters: empty = no filter. */
type TriBool = 'true' | 'false';

type FiltersFormValues = {
    cargo_num?: string;
    statuses?: string[];
    auc_type?: string;
    load_city?: string;
    unload_city?: string;
    load_dates?: [Dayjs | null, Dayjs | null] | null;
    is_available?: TriBool;
    is_bidder?: TriBool;
    price_from?: number | null;
    price_to?: number | null;
};

const statusOptions = Object.entries(AUCTION_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const typeOptions = Object.entries(AUCTION_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const cityOptions = CITIES.map((city) => ({ value: city.name, label: city.name }));
const triBoolOptions = [
    { value: 'true', label: 'Да' },
    { value: 'false', label: 'Нет' },
];

function boolToTri(value: boolean | undefined): TriBool | undefined {
    if (value === true) {
        return 'true';
    }
    if (value === false) {
        return 'false';
    }
    return undefined;
}

function triToBool(value: TriBool | undefined): boolean | undefined {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return undefined;
}

function toFormValues(value: AuctionsSearchParams): FiltersFormValues {
    return {
        cargo_num: value.cargo_num,
        statuses: resolveSelectedStatuses(value),
        auc_type: value.auc_type,
        load_city: value.load_city,
        unload_city: value.unload_city,
        load_dates:
            value.load_date_from || value.load_date_to
                ? [
                      value.load_date_from ? dayjs(value.load_date_from) : null,
                      value.load_date_to ? dayjs(value.load_date_to) : null,
                  ]
                : null,
        is_available: boolToTri(value.is_available),
        is_bidder: boolToTri(value.is_bidder),
        price_from: value.price_from,
        price_to: value.price_to,
    };
}

function FiltersFields() {
    return (
        <div className={styles.groups}>
            <section className={styles.group}>
                <Typography.Title level={5} className={styles.groupTitle}>
                    Аукцион и участие
                </Typography.Title>
                <Typography.Paragraph type='secondary' className={styles.groupHint}>
                    Номер, статус, тип и ваши флаги участия
                </Typography.Paragraph>
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={12}>
                        <Form.Item name='cargo_num' label='Номер заявки'>
                            <Input allowClear placeholder='CRG-…' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name='auc_type' label='Тип аукциона'>
                            <Select allowClear options={typeOptions} placeholder='Любой' />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name='statuses' label='Статус'>
                            <Select mode='multiple' allowClear options={statusOptions} placeholder='Любой' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name='is_available' label='Доступен'>
                            <Select allowClear options={triBoolOptions} placeholder='Не важно' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name='is_bidder' label='Я участник'>
                            <Select allowClear options={triBoolOptions} placeholder='Не важно' />
                        </Form.Item>
                    </Col>
                </Row>
            </section>

            <section className={styles.group}>
                <Typography.Title level={5} className={styles.groupTitle}>
                    Маршрут и цена
                </Typography.Title>
                <Typography.Paragraph type='secondary' className={styles.groupHint}>
                    Города, дата погрузки и диапазон цены
                </Typography.Paragraph>
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={12}>
                        <Form.Item name='load_city' label='Город погрузки'>
                            <Select allowClear showSearch options={cityOptions} placeholder='Из словаря' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name='unload_city' label='Город выгрузки'>
                            <Select allowClear showSearch options={cityOptions} placeholder='Из словаря' />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name='load_dates' label='Дата погрузки'>
                            <DatePicker.RangePicker style={{ width: '100%' }} format='DD.MM.YYYY' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name='price_from' label='Цена от'>
                            <InputNumber style={{ width: '100%' }} min={0} placeholder='0' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name='price_to' label='Цена до'>
                            <InputNumber style={{ width: '100%' }} min={0} placeholder='∞' />
                        </Form.Item>
                    </Col>
                </Row>
            </section>
        </div>
    );
}

export function AuctionFilters({ value, onApply, onReset }: AuctionFiltersProps) {
    const [form] = Form.useForm<FiltersFormValues>();
    const isOpen = useUiStore((state) => state.isFiltersDrawerOpen);
    const setOpen = useUiStore((state) => state.setFiltersDrawerOpen);

    useEffect(() => {
        form.setFieldsValue(toFormValues(value));
    }, [form, value]);

    const submit = (values: FiltersFormValues) => {
        onApply({
            page: 1,
            cargo_num: values.cargo_num || undefined,
            status: undefined,
            statuses: (values.statuses as AuctionsSearchParams['statuses'])?.length
                ? (values.statuses as AuctionsSearchParams['statuses'])
                : undefined,
            auc_type: values.auc_type as AuctionsSearchParams['auc_type'],
            load_city: values.load_city || undefined,
            unload_city: values.unload_city || undefined,
            load_date_from: values.load_dates?.[0]?.format('YYYY-MM-DD') || undefined,
            load_date_to: values.load_dates?.[1]?.format('YYYY-MM-DD') || undefined,
            is_available: triToBool(values.is_available),
            is_bidder: triToBool(values.is_bidder),
            price_from: values.price_from ?? undefined,
            price_to: values.price_to ?? undefined,
        });
        setOpen(false);
    };

    const actions = (
        <div className={styles.actions}>
            <Space wrap>
                <Button
                    onClick={() => {
                        form.resetFields();
                        onReset();
                        setOpen(false);
                    }}
                >
                    Сбросить
                </Button>
                <Button type='primary' htmlType='submit'>
                    Применить
                </Button>
            </Space>
        </div>
    );

    return (
        <>
            <div className={styles.desktop}>
                <Form form={form} layout='vertical' onFinish={submit} initialValues={toFormValues(value)}>
                    <FiltersFields />
                    {actions}
                </Form>
            </div>

            <div className={styles.mobileBar}>
                <Button type='primary' block onClick={() => setOpen(true)}>
                    Фильтры
                </Button>
            </div>

            <Drawer
                title='Фильтры'
                open={isOpen}
                onClose={() => setOpen(false)}
                width={360}
                destroyOnHidden
                className={styles.filtersDrawer}
                styles={{
                    content: {
                        borderRadius: '16px 0 0 16px',
                        overflow: 'hidden',
                    },
                }}
            >
                <Form form={form} layout='vertical' onFinish={submit}>
                    <FiltersFields />
                    {actions}
                </Form>
            </Drawer>
        </>
    );
}
