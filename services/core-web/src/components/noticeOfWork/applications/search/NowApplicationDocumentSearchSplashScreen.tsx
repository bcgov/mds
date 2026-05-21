import React from 'react';
import { Typography, Row, Col, Card } from 'antd';
import { FileSearchOutlined, EnvironmentOutlined, AuditOutlined, BuildOutlined } from '@ant-design/icons';
import SearchBox from '@/components/mine/Permit/Search/components/SearchBox';

const { Title } = Typography;

const exampleQueries = {
    environmental: {
        icon: <EnvironmentOutlined style={{ fontSize: '24px' }} />,
        title: 'Environmental & Reclamation',
        queries: [
            "What environmental impacts are identified in the application?",
            "What reclamation plan is proposed for the mine site?",
            "What water management measures are described?",
        ],
    },
    operations: {
        icon: <BuildOutlined style={{ fontSize: '24px' }} />,
        title: 'Operations & Equipment',
        queries: [
            "What equipment and machinery is listed for the operation?",
            "What access roads or infrastructure are proposed?",
            "What is the proposed production rate or extraction volume?",
        ],
    },
    compliance: {
        icon: <AuditOutlined style={{ fontSize: '24px' }} />,
        title: 'Compliance & Monitoring',
        queries: [
            "What monitoring programs are proposed?",
            "What are the proposed hours of operation?",
            "What bonding or security arrangements are described?",
        ],
    },
    documents: {
        icon: <FileSearchOutlined style={{ fontSize: '24px' }} />,
        title: 'Supporting Documents',
        queries: [
            "What geotechnical assessments have been submitted?",
            "Are there any archaeological or heritage studies included?",
            "What First Nations consultation is documented?",
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
