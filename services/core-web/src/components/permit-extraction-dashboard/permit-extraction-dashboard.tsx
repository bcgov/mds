import React, { useEffect, useState } from 'react';
import { Layout, Card, Table, Statistic, Row, Col, Typography, Tree } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getPermitExtractionStats } from '@/services/permitExtractionService';
import { LoadingOutlined } from '@ant-design/icons';
import PermitConditions from '../mine/Permit/PermitConditions';
import { fetchPermits } from '@mds/common/redux/actionCreators/permitActionCreator';
import { getAmendment } from '@mds/common/redux/selectors/permitSelectors';

const { Title } = Typography;

interface Task {
    task_id: string;
    status: string;
    mine_name: string;
    mine_no: string;
    permit_no: string;
    amendment_issue_date: string;
    document_name: string;
    document_guid: string;
    created: string;
    updated: string;
}

interface DashboardData {
    total_counts: Record<string, number>;
    last_24h: Record<string, number>;
    recent_tasks: Task[];
    mines: any[];
}
const PermitExtractionDashboard: React.FC = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [selectedAmendment, setSelectedAmendment] = useState(null);
    const [selectedPermitGuid, setSelectedPermitGuid] = useState(null);
    const [selectedAmendmentGuid, setSelectedAmendmentGuid] = useState(null);
    const [selectedMineGuid, setSelectedMineGuid] = useState(null);
    const [selectedTask, setSelectedTask] = useState<Task>(null);
    const amendmentFromStore = useSelector(
        getAmendment(selectedPermitGuid, selectedAmendmentGuid)
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getPermitExtractionStats();
                setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedMineGuid) {
            dispatch(fetchPermits(selectedMineGuid));
        }
    }, [selectedMineGuid, dispatch]);

    const recentTaskColumns = [
        { title: 'Mine', dataIndex: 'mine_name', key: 'mine_name' },
        { title: 'Mine No', dataIndex: 'mine_no', key: 'mine_no' },
        { title: 'Permit No', dataIndex: 'permit_no', key: 'permit_no' },
        { title: 'Document', dataIndex: 'document_name', key: 'document_name' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        {
            title: 'Created',
            dataIndex: 'created',
            key: 'created',
            render: (text: string) => new Date(text).toLocaleString()
        }
    ];

    const generateTreeData = (mines: any[]) => {
        console.log(mines)
        return mines.map(mine => ({
            title: `${mine.mine_name} (${mine.mine_no})`,
            key: mine.mine_guid,
            children: mine.permits.map((permit: any) => ({
                title: `Permit: ${permit.permit_no}`,
                key: permit.permit_guid,
                children: permit.amendments.map((amendment: any) => ({
                    title: `Amendment: ${new Date(amendment.issue_date).toLocaleDateString()}`,
                    key: amendment.amendment_guid,
                    children: amendment.tasks.map((task: any) => ({
                        title: `${task.document_name} - ${task.status}`,
                        key: task.task_id,
                        isLeaf: true
                    }))
                }))
            }))
        }));
    };

    const onSelect = (selectedKeys, info) => {
        if (selectedKeys.length === 0) {
            setSelectedPermitGuid(null);
            setSelectedAmendmentGuid(null);
            setSelectedAmendment(null);
            return;
        }

        const amendmentKey = selectedKeys[0];



        // First try to find in the dashboard data
        for (const mine of data?.mines || []) {
            for (const permit of mine.permits) {
                const amendment = permit.amendments.find(
                    (a) => a.amendment_guid === amendmentKey
                );
                if (amendment) {
                    setSelectedPermitGuid(permit.permit_guid);
                    setSelectedAmendmentGuid(amendmentKey);
                    setSelectedAmendment(amendment);
                    setSelectedMineGuid(mine.mine_guid);
                    console.log('taaaaak')
                    console.log(amendment.tasks[0])
                    setSelectedTask(amendment.tasks[0]);
                    return;
                }
            }
        }

        // If not found in dashboard data, use the Redux store data
        if (amendmentFromStore) {
            setSelectedAmendment(amendmentFromStore);
        }
    };

    if (loading) {
        return <LoadingOutlined />;
    }

    return (
        <div className="dashboard-container" style={{ padding: '24px' }}>
            <Title level={2}>Permit Extraction Dashboard</Title>
            <Row gutter={[16, 16]}>
                <Col span={selectedAmendment ? 6 : 24}>
                    <Card title="Mine Hierarchy">
                        {data?.mines && (
                            <Tree
                                treeData={generateTreeData(data.mines)}
                                defaultExpandAll={false}
                                showLine
                                showIcon={false}
                                onSelect={onSelect}
                            />
                        )}
                    </Card>
                </Col>
                {amendmentFromStore && (
                    <Col span={18}>
                        <PermitConditions
                            forceViewConditions={true}
                            latestAmendment={amendmentFromStore}
                            previousAmendment={null}
                            currentAmendment={amendmentFromStore}
                            isReviewComplete={amendmentFromStore.is_review_complete}
                            isExtracted={amendmentFromStore.is_extracted}
                            canStartExtraction={!amendmentFromStore.is_extracted}
                            userCanEdit={true}
                            mineGuid={selectedMineGuid}
                            permitGuid={selectedPermitGuid}
                            extractionTaskGuid={selectedTask?.task_id}
                            permitAmendmentDocumentGuid={selectedTask?.document_guid}
                        />
                    </Col>
                )}
            </Row>
            {!selectedAmendment && (
                <>
                    <Card title="Statistics" className="stats-card" style={{ marginBottom: 24 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Title level={4}>Total Tasks</Title>
                                {data?.total_counts && Object.entries(data.total_counts).map(([status, count]) => (
                                    <Statistic
                                        key={status}
                                        title={status}
                                        value={count}
                                        style={{ marginBottom: 16 }}
                                    />
                                ))}
                            </Col>
                            <Col span={12}>
                                <Title level={4}>Last 24 Hours</Title>
                                {data?.last_24h && Object.entries(data.last_24h).map(([status, count]) => (
                                    <Statistic
                                        key={status}
                                        title={status}
                                        value={count}
                                        style={{ marginBottom: 16 }}
                                    />
                                ))}
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Recent Tasks" className="stats-card">
                        <Table
                            dataSource={data?.recent_tasks}
                            columns={recentTaskColumns}
                            rowKey="task_id"
                            pagination={false}
                        />
                    </Card>
                </>
            )}
        </div>
    );
};

export default PermitExtractionDashboard;