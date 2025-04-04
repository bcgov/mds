import {
    CONSEQUENCE_CLASSIFICATION_STATUS_CODE,
    DAM_OPERATING_STATUS,
    DAM_TYPES,
} from "@mds/common/constants/strings";
import { Alert, Button, Col, Popconfirm, Row, Typography } from "antd";
import {
    decimalPlaces,
    lat,
    lon,
    maxDigits,
    maxLength,
    number,
    required,
    requiredList,
} from "@mds/common/redux/utils/Validate";
import { Link, useHistory, useParams } from "react-router-dom";
import { Field } from "@mds/common/components/forms/form";
import React, { FC } from "react";
import { ITailingsStorageFacility, IDam } from "@mds/common/interfaces";
import RenderSelect from "../../forms/RenderSelect";
import RenderField from "../../forms/RenderField";
import { formatDateTime } from "@mds/common/redux/utils/helpers";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { openModal } from "@mds/common/redux/actions/modalActions";
import DamDiffModal from "./DamDiffModal";

interface DamFormProps {
    tsf: ITailingsStorageFacility;
    dam?: IDam;
    canEditTSF: boolean;
    isEditMode: boolean;
    canEditDam: boolean;
}

interface Params {
    tailingsStorageFacilityGuid: string;
    mineGuid: string;
}

const DamForm: FC<DamFormProps> = (props) => {
    const { tsf, dam, canEditTSF, isEditMode, canEditDam } = props;
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { tailingsStorageFacilityGuid, mineGuid } = useParams<Params>();
    const canEditTSFAndEditMode = canEditTSF && canEditDam;
    const returnUrl = GLOBAL_ROUTES?.EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
        tailingsStorageFacilityGuid,
        mineGuid,
        "associated-dams",
        isEditMode
    );

    const handleBack = () => {
        history.push(returnUrl);
    };

    const openDiffModal = () => {
        dispatch(openModal({
            props: {
                title: "Dam History",
                damGuid: dam.dam_guid,
            },
            content: DamDiffModal
        }))
    };

    const returnLink = (
        <Link to={returnUrl} className="associated-dams-link">
          Return to all Associated Dams of {tsf.mine_tailings_storage_facility_name}.
        </Link>
      );

    return (
        <div>
            <div className="margin-large--bottom">
                <Typography.Title level={4}>Associated Dams - {dam?.dam_name}</Typography.Title>
                {canEditTSFAndEditMode ? (
                    <Popconfirm
                        title={`Are you sure you want to cancel ${tailingsStorageFacilityGuid ? "updating this" : "creating a new"
                            } dam?
            All unsaved data on this page will be lost.`}
                        cancelText="No"
                        okText="Yes"
                        placement="right"
                        onConfirm={handleBack}
                    >
                        {returnLink}
                    </Popconfirm>
                ): (
                    returnLink
                )}
            </div>
            {dam?.update_timestamp && (
                <Row>
                    <Col span={24}>
                        <Typography.Paragraph>
                            <Alert
                                description={`Last Updated by ${dam.update_user}  on ${formatDateTime(
                                    dam.update_timestamp
                                )}`}
                                showIcon
                                message=""
                                className="ant-alert-grey bullet"
                                type="info"
                                style={{ alignItems: "center" }}
                                action={
                                    <Button className="margin-large--left" onClick={openDiffModal}>
                                        View History
                                    </Button>
                                }
                            />
                        </Typography.Paragraph>
                    </Col>
                </Row>
            )}

            <Field
                id="dam_type"
                name="dam_type"
                label="Dam Type"
                component={RenderSelect}
                data={DAM_TYPES}
                required
                validate={[requiredList]}
                disabled={!canEditTSFAndEditMode}
            />
            <Field
                id="dam_name"
                name="dam_name"
                label="Dam Name"
                component={RenderField}
                required
                validate={[required, maxLength(60)]}
                disabled={!canEditTSFAndEditMode}
            />
            <Row gutter={16}>
                <Col span={12}>
                    <Field
                        id="latitude"
                        name="latitude"
                        label="Latitude"
                        component={RenderField}
                        required
                        validate={[required, lat]}
                        disabled={!canEditTSFAndEditMode}
                    />
                </Col>
                <Col span={12}>
                    <Field
                        id="longitude"
                        name="longitude"
                        label="Longitude"
                        component={RenderField}
                        required
                        validate={[required, lon]}
                        disabled={!canEditTSFAndEditMode}
                    />
                </Col>
            </Row>
            <Field
                id="operating_status"
                name="operating_status"
                label="Operating Status"
                component={RenderSelect}
                data={DAM_OPERATING_STATUS}
                required
                validate={[requiredList]}
                disabled={!canEditTSFAndEditMode}
            />
            <Field
                id="consequence_classification"
                name="consequence_classification"
                label="Dam Consequence Classification"
                component={RenderSelect}
                data={CONSEQUENCE_CLASSIFICATION_STATUS_CODE}
                required
                validate={[requiredList]}
                disabled={!canEditTSFAndEditMode}
            />
            <Field
                id="permitted_dam_crest_elevation"
                name="permitted_dam_crest_elevation"
                label="Permitted Dam Crest Elevation (meters above sea level)"
                component={RenderField}
                required
                validate={[required, decimalPlaces(2), number, maxDigits(10)]}
                disabled={!canEditTSFAndEditMode}
            />
            <Field
                id="current_dam_height"
                name="current_dam_height"
                label="Current Dam Height (downstream toe to crest in meters)"
                component={RenderField}
                required
                validate={[required, decimalPlaces(2), number, maxDigits(10)]}
                disabled={!canEditTSFAndEditMode}
            />
            <Field
                id="current_elevation"
                name="current_elevation"
                label="Current Elevation (elevation at the top of the dam in meters)"
                component={RenderField}
                required
                validate={[required, decimalPlaces(2), number, maxDigits(10)]}
                disabled={!canEditTSFAndEditMode}
            />
            <Field
                id="max_pond_elevation"
                name="max_pond_elevation"
                label="Maximum Pond Elevation (meters above sea level recorded in the previous 12 months)"
                component={RenderField}
                required
                validate={[required, decimalPlaces(2), number, maxDigits(10)]}
                disabled={!canEditTSFAndEditMode}
            />
            <Field
                id="min_freeboard_required"
                name="min_freeboard_required"
                label="Minimum Freeboard Required (water surface to the crest of the dam, in meters)"
                component={RenderField}
                required
                validate={[required, decimalPlaces(2), number, maxDigits(10)]}
                disabled={!canEditTSFAndEditMode}
            />
        </div>
    );
};

export default DamForm;
