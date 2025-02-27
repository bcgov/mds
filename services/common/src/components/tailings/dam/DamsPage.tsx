import { Col, Divider, Popconfirm, Row, Typography } from "antd";
import { Link, useHistory, useParams } from "react-router-dom";
import React, { FC, useEffect } from "react";
import { createDam, updateDam } from "@mds/common/redux/actionCreators/damActionCreator";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import SteppedForm from "@mds/common/components/forms/SteppedForm";
import Step from "@mds/common/components/forms/Step";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getDam } from "@mds/common/redux/selectors/damSelectors";
import { getTsf } from "@mds/common/redux/selectors/tailingsSelectors";
import { storeDam } from "@mds/common/redux/actions/damActions";
import { storeTsf } from "@mds/common/redux/actions/tailingsActions";
import DamForm from "./DamForm";
import { IDam, ITailingsStorageFacility } from "@mds/common/interfaces";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import { FORM } from "@mds/common/constants/forms";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";

const DamsPage: FC = () => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const tsf: ITailingsStorageFacility = useAppSelector(getTsf);
    const initialValues: IDam = useAppSelector(getDam);

    const { tailingsStorageFacilityGuid, damGuid, mineGuid, parentTSFFormMode, userAction } =
        useParams<{
            tailingsStorageFacilityGuid: string;
            damGuid?: string;
            mineGuid: string;
            parentTSFFormMode: string;
            userAction: string;
        }>();

    const isCore = useAppSelector(getIsCore);
    const coreCanEditTsf = useAppSelector(userHasRole(USER_ROLES.role_edit_tsf));
    const canEditTSF = !isCore || coreCanEditTsf;
    const isUserActionEdit = userAction === "editDam" || userAction === "newDam";
    const isTSFEditMode = parentTSFFormMode === "edit";

    useEffect(() => {
        if (!tsf.mine_tailings_storage_facility_guid) {
            (async () => {
                const mine = await dispatch(fetchMineRecordById(mineGuid));
                const existingTsf = mine.data.mine_tailings_storage_facilities?.find(
                    (t) => t.mine_tailings_storage_facility_guid === tailingsStorageFacilityGuid
                );
                dispatch(storeTsf(existingTsf));
                const currentDam = existingTsf.dams.find((dam) => dam.dam_guid === damGuid);
                dispatch(storeDam(currentDam));
            })();
        }
    }, []);

    const backUrl = GLOBAL_ROUTES?.EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
        tailingsStorageFacilityGuid,
        mineGuid,
        "associated-dams",
        isTSFEditMode
    );

    const handleBack = () => {
        history.push(backUrl);
    };

    const handleCompleteSubmit = (dam) => {
        const dams = tsf.dams?.filter((tsfDam) => tsfDam.dam_guid !== dam?.dam_guid);
        const updatedTsf = { ...tsf, dams: [dam, ...dams] };
        dispatch(storeTsf(updatedTsf));
        handleBack();
    };

    const handleSave = async (values, newActiveTab) => {
        if (damGuid) {
            const updatedDam = await dispatch(updateDam(damGuid, values));
            handleCompleteSubmit(updatedDam.data);
        } else {
            const newDam = await dispatch(createDam({
                ...values,
                mine_tailings_storage_facility_guid: tailingsStorageFacilityGuid,
            }));
            handleCompleteSubmit(newDam.data);
        }
    };

    const renderTitle = () => {
        if (!isUserActionEdit) {
            return "View Dam";
        }

        return damGuid ? "Edit Dam" : "Create Dam";
    };

    return (
        <div>
            <Row>
                <Col span={24}>
                    <Typography.Title>{renderTitle()}</Typography.Title>
                </Col>
                <Col span={24}>
                    <Popconfirm
                        title={`Are you sure you want to cancel ${tailingsStorageFacilityGuid ? "updating this" : "creating a new"
                            } dam?
            All unsaved data on this page will be lost.`}
                        onConfirm={handleBack}
                        cancelText="No"
                        okText="Yes"
                        placement="right"
                    >
                        <Link to={backUrl}>
                            <ArrowLeftOutlined className="padding-sm--right" />
                            Back to: {tsf.mine_tailings_storage_facility_name} Dams page
                        </Link>
                    </Popconfirm>
                </Col>
            </Row>
            <Divider />
            <SteppedForm
                initialValues={initialValues}
                name={FORM.ADD_EDIT_DAM}
                handleSaveData={handleSave}
                handleTabChange={() => { }}
                activeTab="basic-dam-information"
                submitText={`${isUserActionEdit ? "Save and" : ""} Return to Associated Dams`}
                handleCancel={handleBack}
                cancelConfirmMessage={`Are you sure you want to cancel ${tailingsStorageFacilityGuid ? "updating this" : "creating a new"
                    } dam?
        All unsaved data on this page will be lost.`}
                reduxFormConfig={{
                    touchOnBlur: true,
                    destroyOnUnmount: true,
                    enableReinitialize: true,
                }}
            >
                {[
                    <Step key="basic-dam-information">
                        <DamForm
                            tsf={tsf}
                            dam={initialValues}
                            canEditTSF={canEditTSF}
                            isEditMode={isTSFEditMode}
                            canEditDam={isUserActionEdit}
                        />
                    </Step>,
                ]}
            </SteppedForm>
        </div>
    );
};

export default DamsPage;
