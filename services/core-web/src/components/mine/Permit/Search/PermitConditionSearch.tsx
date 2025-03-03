import React from 'react';
import { Layout, Typography, Row, Col, Card, Space, Form } from 'antd';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import useSearch from './hooks/useSearch';
import MarkdownViewer from './components/MarkdownViewer';
import { SafetyOutlined, EnvironmentOutlined, AuditOutlined, BuildOutlined } from '@ant-design/icons';
import { useAppSelector } from '@mds/common/redux/rootState';
import { selectSearchResults, selectSearchLoading, selectSearchQuery, selectSearchFilters } from '@mds/common/redux/slices/permitSearchSlice';

const exampleQueries = {
    environmental: {
        icon: <EnvironmentOutlined style={{ fontSize: '24px' }} />,
        title: 'Environmental Management',
        queries: [
            "How must the Permittee monitor water quality and quantity on the mine site?",
            "What actions must be taken if excessive sediment-laden runoff is observed?",
            "How should the Permittee manage and control weeds on the site?"
        ]
    },
    safety: {
        icon: <SafetyOutlined style={{ fontSize: '24px' }} />,
        title: 'Safety & Compliance',
        queries: [
            "What inspections are required during rain events and the snowmelt period?",
            "What is the role of the Environmental Site Manager?",
            "What authority does the ESM have in implementing remedial actions?"
        ]
    },
    technical: {
        icon: <BuildOutlined style={{ fontSize: '24px' }} />,
        title: 'Technical Requirements',
        queries: [
            "What are the requirements for using sediment in reclamation activities?",
            "What are the requirements for new building foundation designs?",
            "What research must be conducted for closure water management?"
        ]
    },
    monitoring: {
        icon: <AuditOutlined style={{ fontSize: '24px' }} />,
        title: 'Monitoring & Research',
        queries: [
            "What is the purpose of the detailed monitoring program?",
            "How should revegetation and soil development be monitored?",
            "What parameters must be measured in water quality samples?"
        ]
    }
};
const { Content } = Layout;
const { Title } = Typography;

const PermitConditionSearch: React.FC = () => {
    const [form] = Form.useForm();
    const { setQuery } = useSearch();
    const results = useAppSelector(selectSearchResults);
    const loading = useAppSelector(selectSearchLoading);
    const query = useAppSelector(selectSearchQuery);
    const selectedFilters = useAppSelector(selectSearchFilters);

    const handleQueryClick = (queryText: string) => {
        form.setFieldValue('search', queryText);
        setQuery(queryText);
    };

    const hasActiveSearch = query || selectedFilters?.length > 0;
    const isLoading = loading;
    const shouldShowSplash = !hasActiveSearch && !isLoading;

    return (
        <Layout className="permit-search__layout">
            <Content className="permit-search__content">
                <Form form={form} initialValues={{ search: query }}>
                    {shouldShowSplash ? (
                        <Row justify="center" align="middle">
                            <Space direction="vertical" size="large" align="center" style={{ maxWidth: 900 }}>
                                <Title level={1}>Search Permit Conditions</Title>
                                <Typography.Paragraph style={{ textAlign: 'center', fontSize: '16px' }}>
                                    Search across all permit conditions and get AI-powered insights.
                                    Try searching for specific requirements, locations, or environmental concerns.
                                </Typography.Paragraph>
                                <Row justify="center">
                                    <SearchBox onSearch={setQuery} loading={loading} size="large" value={query} />
                                </Row>

                                <div style={{ marginTop: 48 }}>
                                    <Row justify="center">
                                        <Typography.Title level={4} style={{ marginBottom: 32 }}>
                                            Try these example searches
                                        </Typography.Title>
                                    </Row>
                                    <Row gutter={[24, 24]}>
                                        {Object.entries(exampleQueries).map(([key, category]) => (
                                            <Col xs={24} sm={12} key={key}>
                                                <Card
                                                    hoverable
                                                    style={{ height: '100%' }}
                                                    bodyStyle={{ height: '100%' }}
                                                >
                                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                                        <Space align="center">
                                                            {category.icon}
                                                            <Typography.Text strong>{category.title}</Typography.Text>
                                                        </Space>

                                                        <Space direction="vertical" style={{ width: '100%' }}>
                                                            {category.queries.map((query, idx) => (
                                                                <Typography.Link
                                                                    key={`${key}-${idx}`}
                                                                    onClick={() => handleQueryClick(query)}
                                                                    className="permit-search__example-link"
                                                                >
                                                                    {query}
                                                                </Typography.Link>
                                                            ))}
                                                        </Space>
                                                    </Space>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </Space>
                        </Row>
                    ) : (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Title level={1} style={{ marginBottom: 0 }}>Permit Condition Search</Title>
                            <SearchBox onSearch={setQuery} loading={loading} value={query} />
                            <Row gutter={32}>
                                <Col span={16}>
                                    <SearchResults />
                                </Col>
                                <Col span={8}>
                                    <Card title="AI-Generated Response" loading={loading}>
                                        {results?.prompt?.answers?.map((result) => (
                                            <MarkdownViewer key={`prompt-${result.substring(0, 20)}`} markdown={result} />
                                        ))}
                                    </Card>
                                </Col>
                            </Row>
                        </Space>
                    )}
                </Form>
            </Content>
        </Layout>
    );
};

export default PermitConditionSearch;
