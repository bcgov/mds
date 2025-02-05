import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Card, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import useSearch from './hooks/useSearch';
import MarkdownViewer from './components/MarkdownViewer';
import { SafetyOutlined, EnvironmentOutlined, AuditOutlined, BuildOutlined } from '@ant-design/icons';

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
    const { results, loading, setQuery } = useSearch();
    const hasSearched = results || loading;

    return (
        <Layout style={{ padding: '32px', minHeight: '100vh', background: '#fff' }}>
            <Content style={{ width: '100%', margin: '0 auto' }}>
                {!hasSearched ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Space direction="vertical" size="large" align="center" style={{ maxWidth: 900 }}>
                            <Title level={1}>Search Permit Conditions</Title>
                            <Typography.Paragraph style={{ textAlign: 'center', fontSize: '16px' }}>
                                Search across all permit conditions and get AI-powered insights.
                                Try searching for specific requirements, locations, or environmental concerns.
                            </Typography.Paragraph>
                            <div style={{ width: '100%' }}>
                                <SearchBox onSearch={setQuery} loading={loading} size="large" />
                            </div>

                            <div style={{ marginTop: 48 }}>
                                <Typography.Title level={4} style={{ textAlign: 'center', marginBottom: 32 }}>
                                    Try these example searches
                                </Typography.Title>

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
                                                                key={idx}
                                                                onClick={() => setQuery(query)}
                                                                style={{
                                                                    display: 'block',
                                                                    borderRadius: '4px',
                                                                    ':hover': {
                                                                        backgroundColor: '#f5f5f5'
                                                                    }
                                                                }}
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
                    </div>
                ) : (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Title level={2} style={{ marginBottom: 0 }}>Permit Condition Search</Title>
                        <SearchBox onSearch={setQuery} loading={loading} />
                        <Row gutter={32}>
                            <Col span={16}>
                                <SearchResults results={results} loading={loading} />
                            </Col>
                            <Col span={8}>
                                <Card title="AI-Generated Response" loading={loading}>
                                    {results?.prompt?.answers?.map((result, idx) => (
                                        <MarkdownViewer key={`prompt-${idx}`} markdown={result} />
                                    ))}
                                </Card>
                            </Col>
                        </Row>
                    </Space>
                )}
            </Content>
        </Layout>
    );
};

export default PermitConditionSearch;
