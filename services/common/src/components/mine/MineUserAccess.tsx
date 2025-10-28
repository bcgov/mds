import React, { FC, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { fetchMinespaceUsersByMine, getMinespaceUsersByMineGuid } from "@mds/common/redux/slices/minespaceSlice";
import CoreTable from "../common/CoreTable";
import { renderTextColumn } from "../common/CoreTableCommonColumns";
import { Col, Row, Typography } from "antd";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { MDS_EMAIL } from "@mds/common/constants/strings";


interface MineUserAccessParams {
    mineGuid: string;
}

const MineUserAccess: FC<MineUserAccessParams> = ({ mineGuid }) => {
    const dispatch = useAppDispatch();
    const mineUsers = useAppSelector(getMinespaceUsersByMineGuid(mineGuid));
    const isCore = useAppSelector(getIsCore);

    useEffect(() => {
        if (!mineUsers) {
            dispatch(fetchMinespaceUsersByMine(mineGuid))
        }
    }, []);

    const columns = [
        renderTextColumn("email_or_username", "BCeID/Email", true)
    ];

    return (<Row>
        <Col span={24}>
            <Typography.Title level={isCore ? 2 : 1}>User Access to Mine Records</Typography.Title>
            <Typography.Paragraph>This page displays the list of <b>BCeID users</b> who currently have access to the records for this mine in <b>MineSpace.</b></Typography.Paragraph>
            <Typography.Paragraph>If you notice any inaccuracies or need to remove a user's access, please contact <a href={`mailto:${MDS_EMAIL}`}>{MDS_EMAIL}</a> to arrange updates.</Typography.Paragraph>
            <Typography.Paragraph><b>Coming soon:</b> Enhanced access management features will be introduced, giving you more control over who can view and manage mine records. Stay tuned!</Typography.Paragraph>
            <CoreTable
                condition={Boolean(mineUsers)}
                dataSource={mineUsers}
                columns={columns}
                rowKey="user_id"
            />
        </Col>
    </Row>);
};

export default MineUserAccess;