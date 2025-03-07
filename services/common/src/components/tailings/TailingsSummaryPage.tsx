import { Col, Divider, Row, Typography } from "antd";
import { Link, useHistory, useParams } from "react-router-dom";
import React, { FC, useEffect, useState } from "react";
import {
    addDocumentToRelationship,
    addPartyRelationship,
    fetchPartyRelationships,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { clearTsf } from "@mds/common/redux/actions/tailingsActions";
import {
    createTailingsStorageFacility,
    fetchMineRecordById,
    fetchTailingsStorageFacility,
    updateTailingsStorageFacility,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import { isDirty } from "@mds/common/components/forms/form";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import BasicInformation from "@mds/common/components/tailings/BasicInformation";
import Step from "@mds/common/components/forms/Step";
import SteppedForm from "@mds/common/components/forms/SteppedForm";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { getTsf } from "@mds/common/redux/selectors/tailingsSelectors";
import EngineerOfRecord from "./EngineerOfRecord";
import QualifiedPerson from "./QualifiedPerson";
import AssociatedDams from "./AssociatedDams";
import {
    getEngineersOfRecord,
    getQualifiedPersons,
} from "@mds/common/redux/selectors/partiesSelectors";
import {
    ICreateTailingsStorageFacility,
    IMine,
    ITailingsStorageFacility,
} from "@mds/common/interfaces";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import Loading from "../common/Loading";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { FORM } from "@mds/common/constants/forms";


export const TailingsSummaryPage: FC = () => {

    const { mineGuid, tailingsStorageFacilityGuid: tsfGuid, tab, userAction = "edit" } = useParams<
        { mineGuid: string, tailingsStorageFacilityGuid: string, tab: string, userAction: string }
    >();

    const formName = FORM.ADD_TAILINGS_STORAGE_FACILITY;
    const history = useHistory();
    const dispatch = useAppDispatch();
    const tsf: ITailingsStorageFacility = useAppSelector(getTsf);
    const mine: IMine = useAppSelector(getMineById(mineGuid));
    const isCore = useAppSelector(getIsCore);
    const coreCanEditTsf = useAppSelector(userHasRole(USER_ROLES.role_edit_tsf));
    const isFormDirty = useAppSelector(isDirty(formName));
    const engineers_of_record = useAppSelector(getEngineersOfRecord);
    const qualified_persons = useAppSelector(getQualifiedPersons);
    const initialValues = {
        ...tsf,
        engineers_of_record,
        qualified_persons
    };

    const [isLoaded, setIsLoaded] = useState(false);
    const [isReloading, setIsReloading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const canEditTSF = !isCore || coreCanEditTsf;

    const isUserActionEdit = canEditTSF && userAction === "edit";

    const handleFetchData = async (forceReload = false) => {
        setIsReloading(true);
        await dispatch(fetchPermits(mineGuid));

        if (tsfGuid) {
            if (!initialValues.mine_tailings_storage_facility_guid || forceReload) {
                await Promise.all([
                    dispatch(fetchMineRecordById(mineGuid)),
                    dispatch(fetchTailingsStorageFacility(mineGuid, tsfGuid)),
                ]);

                await dispatch(fetchPartyRelationships({
                    mine_guid: mineGuid,
                    relationships: "party",
                    include_permit_contacts: "true",
                    mine_tailings_storage_facility_guid: tsfGuid,
                }));
            }
        }
        setIsLoaded(true);
        setIsReloading(false);
    };

    useEffect(() => {
        handleFetchData(true);
    }, [mineGuid, tsfGuid]);


    const handleAddDocuments = async (minePartyApptGuid) => {
        await Promise.all(
            uploadedFiles.map((document) =>
                dispatch(addDocumentToRelationship(
                    { mineGuid, minePartyApptGuid },
                    {
                        document_name: document.document_name,
                        document_manager_guid: document.document_manager_guid,
                    }
                ))
            )
        );
        setUploadedFiles([]);
    };

    const handleSaveData = async (values, newActiveTab) => {
        let newTsf = null;

        switch (tab) {
            case "basic-information":
                if (tsfGuid) {
                    if (isFormDirty) {
                        await dispatch(updateTailingsStorageFacility(mineGuid, tsfGuid, values));
                    }
                } else {
                    newTsf = await dispatch(createTailingsStorageFacility(
                        mineGuid,
                        values as ICreateTailingsStorageFacility
                    ));
                    await dispatch(clearTsf());
                }
                break;
            case "engineer-of-record":
            case "qualified-person":
                if (!isFormDirty) {
                    break;
                }

                const { attr, apptType, successMessage } = {
                    "engineer-of-record": {
                        attr: "engineer_of_record",
                        apptType: MinePartyAppointmentTypeCodeEnum.EOR,
                        successMessage: "Successfully assigned Engineer of Record",
                    },
                    "qualified-person": {
                        attr: "qualified_person",
                        apptType: MinePartyAppointmentTypeCodeEnum.TQP,
                        successMessage: "Successfully assigned Qualified Person",
                    },
                }[tab];

                if (!values[attr].mine_party_appt_guid && values[attr].party_guid) {
                    // Only add party relationship if changed
                    const relationship = await dispatch(addPartyRelationship(
                        {
                            mine_guid: mineGuid,
                            party_guid: values[attr].party_guid,
                            mine_party_appt_type_code: apptType,
                            related_guid: tsfGuid,
                            start_date: values[attr].start_date,
                            end_date: values[attr].end_date,
                            end_current: true,
                        },
                        successMessage
                    ));

                    if (uploadedFiles.length > 0) {
                        await handleAddDocuments(relationship.data.mine_party_appt_guid);
                    }

                    await handleFetchData(true);
                }
                break;
            default:
                break;
        }

        history.push(
            GLOBAL_ROUTES?.EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
                newTsf?.data.mine_tailings_storage_facility_guid || tsfGuid,
                mineGuid,
                newActiveTab || "engineer-of-record",
                isUserActionEdit
            )
        );
    };

    const handleTabChange = async (newActiveTab) => {
        let url;

        if (tsfGuid) {
            url = GLOBAL_ROUTES?.EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
                tsfGuid,
                mineGuid,
                newActiveTab,
                isUserActionEdit
            );
        } else {
            url = GLOBAL_ROUTES?.ADD_TAILINGS_STORAGE_FACILITY.dynamicRoute(newActiveTab);
        }
        history.push(url);
    };

    const mineName = mine?.mine_name || "";
    const hasCreatedTSF = !!initialValues?.mine_tailings_storage_facility_guid;

    return (
        (isLoaded && (
            <div>
                <Row>
                    <Col span={24}>
                        <Typography.Title>
                            {hasCreatedTSF
                                ? initialValues.mine_tailings_storage_facility_name
                                : "Create facility"}
                        </Typography.Title>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Link to={GLOBAL_ROUTES?.MINE_TAILINGS.dynamicRoute(mineGuid)}>
                            <ArrowLeftOutlined className="padding-sm--right" />
                            {`Back to: ${mineName} Tailings`}
                        </Link>
                    </Col>
                </Row>
                <Divider />
                <SteppedForm
                    initialValues={initialValues}
                    name={formName}
                    isEditMode={isUserActionEdit}
                    handleSaveData={handleSaveData}
                    handleTabChange={handleTabChange}
                    activeTab={tab}
                    sectionChangeText={isUserActionEdit ? undefined : "Continue"}
                    reduxFormConfig={{
                        touchOnBlur: true,
                        touchOnChange: false,
                        enableReinitialize: true,
                        destroyOnUnmount: true,
                    }}
                >
                    <Step key="basic-information">
                        <BasicInformation
                            mineName={mineName}
                            canEditTSF={canEditTSF}
                            isEditMode={isUserActionEdit}
                        />
                    </Step>
                    <Step key="engineer-of-record" disabled={!hasCreatedTSF}>
                        <EngineerOfRecord
                            loading={isReloading}
                            mineGuid={mineGuid}
                            uploadedFiles={uploadedFiles}
                            setUploadedFiles={setUploadedFiles}
                            canEditTSF={canEditTSF}
                            isEditMode={isUserActionEdit}
                        />
                    </Step>
                    <Step key="qualified-person" disabled={!hasCreatedTSF}>
                        <QualifiedPerson
                            loading={isReloading}
                            mineGuid={mineGuid}
                            canEditTSF={canEditTSF}
                            isEditMode={isUserActionEdit}
                        />
                    </Step>
                    <Step key="associated-dams" disabled={!hasCreatedTSF}>
                        <AssociatedDams canEditTSF={canEditTSF} isEditMode={isUserActionEdit} />
                    </Step>
                </SteppedForm>
            </div>
        )) || <Loading />
    );
};

export default TailingsSummaryPage;
