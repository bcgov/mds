import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Card, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import useSearch from './hooks/useSearch';
import MarkdownViewer from './components/MarkdownViewer';

const { Content } = Layout;
const { Title } = Typography;

const PermitConditionSearch: React.FC = () => {
    const { results, loading, setQuery } = useSearch();
    console.log(results)

    return (
        <Layout style={{ padding: '24px', minHeight: '100vh', background: '#fff' }}>
            <Content>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Title level={2}>Permit Condition Search</Title>

                    <SearchBox onSearch={setQuery} loading={loading} />
                    <Row gutter={24}>
                        <Col span={12}>
                            <SearchResults results={results} loading={loading} />
                        </Col>

                        <Col span={12}>
                            <Card title="AI-Generated Response" loading={loading}>
                                {results?.prompt?.answers?.map((result, idx) => (
                                    <MarkdownViewer key={`prompt-${idx}`} markdown={result} />
                                ))}
                            </Card>
                        </Col>

                    </Row>
                </Space>
            </Content>
        </Layout>
    );
};

export default PermitConditionSearch;
