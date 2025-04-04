import { Col, Divider, Popconfirm, Row, Typography } from "antd";
import { Link, useHistory, useParams } from "react-router-dom";
import React, { FC, useEffect } from "react";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import SteppedForm from "@mds/common/components/forms/SteppedForm";
import Step from "@mds/common/components/forms/Step";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getTsf } from "@mds/common/redux/selectors/tailingsSelectors";
import { storeTsf } from "@mds/common/redux/actions/tailingsActions";
import DamForm from "./DamForm";
import { ITailingsStorageFacility } from "@mds/common/interfaces";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import { FORM } from "@mds/common/constants/forms";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { createDam, getDamByGuid, storeDam, updateDam } from "@mds/common/redux/slices/damSlice";
import { isDirty } from "../../forms/form";

const DamsPage: FC = () => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const tsf: ITailingsStorageFacility = useAppSelector(getTsf);

    const { tailingsStorageFacilityGuid, damGuid, mineGuid, parentTSFFormMode, userAction } =
        useParams<{
            tailingsStorageFacilityGuid: string;
            damGuid?: string;
            mineGuid: string;
            parentTSFFormMode: string;
            userAction: string;
        }>();

    const initialValues = useAppSelector(getDamByGuid(damGuid));
    const isCore = useAppSelector(getIsCore);
    const coreCanEditTsf = useAppSelector(userHasRole(USER_ROLES.role_edit_tsf));
    const canEditTSF = !isCore || coreCanEditTsf;
    const isUserActionEdit = userAction === "editDam" || userAction === "newDam";
    const isTSFEditMode = parentTSFFormMode === "edit";
    const isFormDirty = useAppSelector(isDirty(FORM.ADD_EDIT_DAM))

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
        if(isUserActionEdit && isFormDirty){
            if (damGuid) {
                const updatedDam = await dispatch(updateDam(values));
                handleCompleteSubmit(updatedDam);
            } else {
                const newDam = await dispatch(createDam({
                    ...values,
                    mine_tailings_storage_facility_guid: tailingsStorageFacilityGuid,
                }));
                handleCompleteSubmit(newDam);
            }
        } else {
            handleBack();
        }
    };

    const renderTitle = () => {
        if (!isUserActionEdit) {
            return "View Dam";
        }

        return damGuid ? "Edit Dam" : "Create Dam";
    };

    const returnLink = (
        <Link to={backUrl}>
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to: {tsf.mine_tailings_storage_facility_name} Dams page
        </Link>
    )

    return (
        <div>
            <Row>
                <Col span={24}>
                    <Typography.Title>{renderTitle()}</Typography.Title>
                </Col>
                <Col span={24}>
                    {isUserActionEdit ? (
                        <Popconfirm
                            title={`Are you sure you want to cancel ${tailingsStorageFacilityGuid ? "updating this" : "creating a new"
                                } dam?
                All unsaved data on this page will be lost.`}
                            onConfirm={handleBack}
                            cancelText="No"
                            okText="Yes"
                            placement="right"
                        >
                            {returnLink}
                        </Popconfirm>
                    ) : (
                        returnLink
                    )}
                </Col>
            </Row>
            <Divider />
            <SteppedForm
                initialValues={initialValues}
                isEditMode={isTSFEditMode}
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
