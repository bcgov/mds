import React from 'react';
import { Typography, Row, Col, Card } from 'antd';
import { SafetyOutlined, EnvironmentOutlined, AuditOutlined, BuildOutlined } from '@ant-design/icons';
import SearchBox from './SearchBox';
import { useAppDispatch } from '@mds/common/redux/rootState';
import { change } from '@mds/common/components/forms/form';
import { FORM } from '@mds/common/constants/forms';

const { Title } = Typography;

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

interface PermitConditionSearchSplashScreenProps {
    onSearch: (query: string) => void;
    loading: boolean;
}

const PermitConditionSearchSplashScreen: React.FC<PermitConditionSearchSplashScreenProps> = ({ onSearch, loading }) => {
    const dispatch = useAppDispatch();

    const handleQueryClick = (queryText: string) => {
        dispatch(change(FORM.PERMIT_CONDITION_SEARCH, "search", queryText));
        onSearch(queryText);
    };

    return (
        <Row justify="center" align="middle">
            <Col xs={24} style={{ maxWidth: '900px' }}>
                <Row gutter={[0, 24]}>
                    <Col xs={24} style={{ textAlign: 'center' }}>
                        <Title level={1}>Search Permit Conditions</Title>

                        <Typography.Paragraph style={{ fontSize: '16px' }}>
                            Search across all permit conditions and get AI-powered insights.
                            Try searching for specific requirements, locations, or environmental concerns.
                        </Typography.Paragraph>
                        <SearchBox onSearch={onSearch} loading={loading} size="large" />
                    </Col>

                    <Col xs={24} style={{ textAlign: 'center', marginTop: 24 }}>
                        <Typography.Title level={4} style={{ marginBottom: 32 }}>
                            Try these example searches
                        </Typography.Title>
                    </Col>
                </Row>
                <Row gutter={[0, 24]}>
                    {Object.entries(exampleQueries).map(([key, category]) => (
                        <Col xs={24} sm={12} key={key} style={{ marginBottom: 24, padding: "0px 20px" }}>
                            <Card
                                hoverable
                                style={{ height: '100%' }}
                                bodyStyle={{ height: '100%' }}
                            >
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
                                                        onClick={() => handleQueryClick(query)}
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
            </Col >
        </Row >
    );
};

export default PermitConditionSearchSplashScreen;
