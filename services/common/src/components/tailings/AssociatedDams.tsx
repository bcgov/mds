import { Button, Col, Row, Typography } from "antd";
import {
    CONSEQUENCE_CLASSIFICATION_CODE_HASH,
    DAM_OPERATING_STATUS_HASH,
    EMPTY_FIELD,
} from "@mds/common/constants/strings";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import React, { FC } from "react";
import moment from "moment";
import { storeDam } from "@mds/common/redux/slices/damSlice";
import { useHistory } from "react-router-dom";
import { IDam, ITailingsStorageFacility, ITailingsStorageFacilityForm } from "@mds/common/interfaces";
import { ColumnsType } from "antd/lib/table";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { getFormValues } from "../forms/form";
import { FORM } from "@mds/common/constants/forms";
import { getTsfByGuid } from "@mds/common/redux/slices/tailingsSlice";

interface AssociatedDamsProps {
    canEditTSF: boolean;
    isEditMode: boolean;
}

const AssociatedDams: FC<AssociatedDamsProps> = (props) => {
    const history = useHistory();
    const dispatch = useAppDispatch();
    const { isEditMode, canEditTSF } = props;
    const formValues = useAppSelector(getFormValues(FORM.ADD_TAILINGS_STORAGE_FACILITY)) as ITailingsStorageFacilityForm;
    const tsf: ITailingsStorageFacility = useAppSelector(getTsfByGuid(formValues?.mine_guid, formValues?.mine_tailings_storage_facility_guid));
    const isCore = useAppSelector(getIsCore);

    const handleNavigateToEdit = (event, dam, canEditDam) => {
        event.preventDefault();
        dispatch(storeDam(dam));
        const url = GLOBAL_ROUTES?.EDIT_DAM.dynamicRoute(
            tsf.mine_guid,
            dam.mine_tailings_storage_facility_guid,
            dam.dam_guid,
            isEditMode,
            canEditDam
        );
        history.push(url);
    };

    const handleNavigateToCreate = () => {
        const url = GLOBAL_ROUTES?.ADD_DAM.dynamicRoute(tsf.mine_guid, tsf.mine_tailings_storage_facility_guid);
        history.push(url);
    };

    const actions = [
        {
            key: "view",
            label: "View Dam",
            icon: <EyeOutlined />,
            clickFunction: (event, record) => {
                handleNavigateToEdit(event, record, false);
            },
        },
        ...(isEditMode
            ? [
                {
                    key: "edit",
                    label: "Edit Dam",
                    icon: <EditOutlined />,
                    clickFunction: (event, record) => {
                        handleNavigateToEdit(event, record, true);
                    },
                },
            ]
            : []),
    ];

    const columns: ColumnsType<IDam> = [
        {
            title: "Name",
            dataIndex: "dam_name",
            key: "dam_name",
        },
        {
            title: "Operating Status",
            dataIndex: "operating_status",
            key: "operating_status",
            render: (text) => <Typography.Text>{DAM_OPERATING_STATUS_HASH[text]}</Typography.Text>,
        },
        {
            title: "Consequence Classification",
            dataIndex: "consequence_classification",
            key: "consequence_classification",
            render: (text) => (
                <Typography.Text>{CONSEQUENCE_CLASSIFICATION_CODE_HASH[text]}</Typography.Text>
            ),
        },
        {
            title: "Permitted Crest Elevation",
            dataIndex: "permitted_dam_crest_elevation",
            key: "permitted_dam_crest_elevation",
        },
        {
            title: "Current Height",
            dataIndex: "current_dam_height",
            key: "current_dam_height",
        },
        {
            title: "Current Elavation",
            dataIndex: "current_elevation",
            key: "current_elevation",
        },
        {
            title: "Max Pond Elevation",
            dataIndex: "max_pond_elevation",
            key: "max_pond_elevation",
        },
        renderActionsColumn({ actions }),
    ];

    const mostRecentUpdatedDate = tsf.dams.length ? moment(
        Math.max.apply(
            null,
            tsf.dams.map((dam) => moment(dam.update_timestamp))
        )
    ).format("DD-MM-YYYY H:mm") : EMPTY_FIELD;

    return (
        <div>
            <Row justify="space-between" align="middle" className="associated-dams-header">
                <Col>
                    <Typography.Title level={3} className="gov-blue-title">
                        Associated Dams
                    </Typography.Title>
                    <Typography.Text>
                        Dams related to {tsf.mine_tailings_storage_facility_name}
                    </Typography.Text>
                </Col>
                <Col>
                    {isCore &&
                        <div>
                            <Typography.Paragraph strong style={{ textAlign: "right" }}>
                                Last Updated
                            </Typography.Paragraph>
                            <Typography.Paragraph style={{ textAlign: "right" }}>{mostRecentUpdatedDate}</Typography.Paragraph>
                        </div>
                    }
                    {
                        canEditTSF && isEditMode &&
                        <Button type="primary" onClick={handleNavigateToCreate}>
                            <PlusCircleFilled />
                            Create a new dam
                        </Button>
                    }
                </Col>
            </Row>
            <CoreTable columns={columns} dataSource={tsf.dams} />
        </div>
    );
};

export default AssociatedDams;
