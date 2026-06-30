import React from 'react';
import { Alert, Typography, Row, Col, Card } from 'antd';
import { AimOutlined, FileSearchOutlined, EnvironmentOutlined, AuditOutlined } from '@ant-design/icons';
import SearchBox from '@/components/mine/Permit/Search/components/SearchBox';

const { Title } = Typography;

const exampleQueries = {
    activities: {
        icon: <AimOutlined style={{ fontSize: '24px' }} />,
        title: 'Activities & Scope',
        queries: [
            "What is the timeline of the proposed activities?",
            "What activities are planned (e.g. drilling, trenching)?",
            "How much land disturbance is proposed?",
            "What approvals, permits or authorizations are identified or may be required?"
        ],
    },
    environmental: {
        icon: <EnvironmentOutlined style={{ fontSize: '24px' }} />,
        title: 'Environment & Reclamation',
        queries: [
            "What environmental considerations are identified?",
            "What reclamation activities are planned?",
            "How will water runoff be managed?",
            "Are any environmental management or monitoring plans included?"
        ],
    },
    engagement: {
        icon: <AuditOutlined style={{ fontSize: '24px' }} />,
        title: 'Engagement',
        queries: [
            "What indigenous engagement has been completed or documented?",
            "Are there any identified cultural or heritage considerations?",
        ],
    },
    operations: {
        icon: <FileSearchOutlined style={{ fontSize: '24px' }} />,
        title: 'Operations',
        queries: [
            "What equipment and machinery are proposed for the work?",
            "Are there any high-risk activities (e.g. blasting) proposed?",
        ],
    },
};

interface NowApplicationDocumentSearchSplashScreenProps {
    onSearch: (query: string) => void;
    loading: boolean;
}

const NowApplicationDocumentSearchSplashScreen: React.FC<NowApplicationDocumentSearchSplashScreenProps> = ({
    onSearch,
    loading,
}) => {
    return (
        <Row justify="center" align="middle">
            <Col xs={24} style={{ maxWidth: '900px' }}>
                <Row gutter={[0, 24]}>
                    <Col xs={24} style={{ textAlign: 'center' }}>
                        <Title level={1}>Search Application Documents</Title>
                        <Typography.Paragraph style={{ fontSize: '16px' }}>
                            Search across all documents submitted with this Notice of Work application
                            and get AI-powered answers. Try searching for specific plans, assessments,
                            or operational details.
                        </Typography.Paragraph>
                        <Alert
                            showIcon
                            type="warning"
                            style={{ marginBottom: 16 }}
                            description="Note: Spatial files (e.g. shapefiles) are not indexed and will not appear in search results."
                        />
                        <SearchBox onSearch={onSearch} loading={loading} size="large" placeholder="Search application documents..." />
                    </Col>

                    <Col xs={24} style={{ textAlign: 'center', marginTop: 24 }}>
                        <Typography.Title level={4} style={{ marginBottom: 32 }}>
                            Try these example searches
                        </Typography.Title>
                    </Col>
                </Row>
                <Row gutter={[0, 24]}>
                    {Object.entries(exampleQueries).map(([key, category]) => (
                        <Col xs={24} sm={12} key={key} style={{ marginBottom: 24, padding: '0px 20px' }}>
                            <Card hoverable style={{ height: '100%' }} bodyStyle={{ height: '100%' }}>
                                <Row gutter={[0, 16]}>
                                    <Col xs={24}>
                                        <Row align="middle" gutter={8}>
                                            {category.icon}
                                            <Col>
                                                <Typography.Text strong>{category.title}</Typography.Text>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={24}>
                                        <Row gutter={[0, 8]}>
                                            {category.queries.map((query, idx) => (
                                                <Col xs={24} key={`${key}-${idx}`}>
                                                    <Typography.Link
                                                        onClick={() => onSearch(query)}
                                                        className="permit-search__example-link"
                                                    >
                                                        {query}
                                                    </Typography.Link>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Col>
        </Row>
    );
};

export default NowApplicationDocumentSearchSplashScreen;
