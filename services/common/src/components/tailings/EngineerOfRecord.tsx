import { Alert, Button, Col, Empty, Popconfirm, Row, Typography } from "antd";
import { change, Field, getFormValues } from "@mds/common/components/forms/form";
import React, { FC, useContext, useEffect, useState } from "react";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import {
    IDocument,
    IMine,
    IMinePartyAppt,
    ITailingsStorageFacilityForm,
} from "@mds/common/interfaces";
import { TailingsContext } from "./TailingsContext";
import { MINE_PARTY_APPOINTMENT_DOCUMENTS } from "@mds/common/constants/API";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import {
    dateInFuture,
    dateNotInFuture,
    required,
    validateDateRanges,
} from "@mds/common/redux/utils/Validate";
import { formatDateTime, truncateFilename } from "@mds/common/redux/utils/helpers";
import { PDF } from "@mds/common/constants/fileTypes";
import moment from "moment";
import { isNumber } from "lodash";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import PartyAppointmentTable from "./PartyAppointmentTable";
import { ColumnsType } from "antd/lib/table";
import CoreTable from "@mds/common/components/common/CoreTable";
import { PARTY_APPOINTMENT_STATUS } from "@mds/common/constants/strings";
import FileUpload from "../forms/RenderFileUpload";
import RenderDate from "../forms/RenderDate";
import { FORM } from "@mds/common/constants/forms";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import LinkButton from "../common/LinkButton";
import ContactDetails from "./ContactDetails";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";


interface EngineerOfRecordProps {
    uploadedFiles: IDocument[];
    setUploadedFiles: (value: Partial<IDocument>[]) => void;
    mineGuid: string;
    loading?: boolean;
    canEditTSF: boolean;
    isEditMode: boolean;
}

const columns = (LinkButton): ColumnsType<IDocument> => [
    {
        title: "File Name",
        dataIndex: "document_name",
        render: (text, record) => {
            return (
                <div title="File Name" key={record.mine_document_guid}>
                    <LinkButton title={text} onClick={() => downloadFileFromDocumentManager(record)}>
                        {truncateFilename(text)}
                    </LinkButton>
                </div>
            );
        },
    },
];

export const EngineerOfRecord: FC<EngineerOfRecordProps> = (props) => {
    const {
        mineGuid,
        uploadedFiles,
        setUploadedFiles,
        loading,
        canEditTSF,
        isEditMode,
    } = props;

    const dispatch = useAppDispatch();
    const [openPopConfirm, setOpenPopConfirm] = useState(false);

    const {
        addContactModalConfig,
    } = useContext(TailingsContext);
    const tsfFormName = FORM.ADD_TAILINGS_STORAGE_FACILITY;
    const isCore = useAppSelector(getIsCore);
    const partyRelationships: IMinePartyAppt[] = useAppSelector(getPartyRelationships)
    const mine: IMine = useAppSelector(getMineById(mineGuid));

    const formValues = useAppSelector(getFormValues(tsfFormName)
    ) as ITailingsStorageFacilityForm;

    const [currentEor, setCurrentEor] = useState(null);
    const handleCreateEOR = (value) => {
        dispatch(change(tsfFormName, "engineer_of_record.party_guid", value.party_guid));
        dispatch(change(tsfFormName, "engineer_of_record.party", value));
        dispatch(change(tsfFormName, "engineer_of_record.start_date", null));
        dispatch(change(tsfFormName, "engineer_of_record.end_date", null));
        dispatch(change(tsfFormName, "engineer_of_record.mine_party_appt_guid", null));
        setCurrentEor(null);
        dispatch(closeModal());
    };

    const canEditTSFAndEditMode = canEditTSF && isEditMode;

    useEffect(() => {
        if (partyRelationships.length > 0) {
            const activeEor = partyRelationships.find(
                (eor) => eor.mine_party_appt_guid === formValues?.engineer_of_record?.mine_party_appt_guid
            );

            if (activeEor) {
                setCurrentEor(activeEor);
            }
        }
    }, [partyRelationships]);

    const openCreateEORModal = (event) => {
        event?.preventDefault();
        setOpenPopConfirm(false);

        dispatch(openModal({
            props: {
                onSubmit: handleCreateEOR,
                title: "Select Contact",
                partyRelationships,
                mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum.EOR,
                mine: mine,
                createPartyOnly: true,
            },
            content: addContactModalConfig,
        }));
    };

    const onFileLoad = (documentName, document_manager_guid) => {
        setUploadedFiles([
            ...uploadedFiles,
            {
                document_name: documentName,
                document_manager_guid,
            },
        ]);
        dispatch(change(tsfFormName, "engineer_of_record.eor_document_guid", document_manager_guid));
    };

    const onRemoveFile = (_, fileItem) => {
        setUploadedFiles(
            uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
        );
        dispatch(change(tsfFormName, "engineer_of_record.eor_document_guid", null));
    };

    const existingEors = partyRelationships?.filter(
        (p) =>
            p.mine_party_appt_type_code === "EOR" &&
            p.mine_guid === mineGuid &&
            p.related_guid === formValues.mine_tailings_storage_facility_guid
    );

    const validateEorStartDateOverlap = (val) => {
        if (formValues?.engineer_of_record?.mine_party_appt_guid || loading) {
            // Skip validation for existing EoRs
            return undefined;
        }

        return (
            validateDateRanges(
                existingEors || [],
                { ...formValues?.engineer_of_record, start_date: val },
                "Engineer of Record",
                true
            )?.start_date || undefined
        );
    };

    const daysToEORExpiry =
        currentEor?.end_date &&
        moment(currentEor.end_date).startOf("day").diff(moment().startOf("day"), "days");

    // Enable editing of the EoR when a new EoR party has been selected (party_guid is set),
    // but it has yet to be assigned to the TSF (mine_party_appt_guid is not set).
    const canEditEOR =
        formValues?.engineer_of_record?.party_guid &&
        !formValues?.engineer_of_record?.mine_party_appt_guid;

    const fieldsDisabled = !canEditEOR || loading || !canEditTSFAndEditMode;

    const hasPendingEOR = formValues?.engineers_of_record?.some(
        (eor) => PARTY_APPOINTMENT_STATUS[eor.status] === PARTY_APPOINTMENT_STATUS.pending
    );

    const hasCurrentEOR = formValues?.engineers_of_record?.some(
        (eor) => PARTY_APPOINTMENT_STATUS[eor.status] === PARTY_APPOINTMENT_STATUS
    );

    const handleCreateEORModal = (newOpen: boolean) => {
        if (!newOpen) {
            setOpenPopConfirm(newOpen);
            return;
        }
        if (hasCurrentEOR || hasPendingEOR) {
            setOpenPopConfirm(true);
        } else {
            openCreateEORModal(undefined);
        }
    };

    return (
        <>
            <Row>
                <Col span={24}>
                    <Row justify="space-between">
                        <Typography.Title level={3}>Engineer of Record</Typography.Title>

                        <Col span={12}>
                            <Row justify="end">
                                {canEditTSFAndEditMode && (
                                    <Popconfirm
                                        style={{ maxWidth: "150px" }}
                                        open={openPopConfirm}
                                        placement="top"
                                        title="Once acknowledged by the Ministry, assigning a new Engineer of Record will replace the current one and set the previous status to inactive. Continue?"
                                        okText="Yes"
                                        cancelText="No"
                                        onOpenChange={handleCreateEORModal}
                                        onConfirm={openCreateEORModal}
                                        onCancel={() => setOpenPopConfirm(false)}
                                    >
                                        <Button style={{ display: "inline", float: "right" }} type="primary">
                                            <PlusCircleFilled />
                                            Assign a new Engineer of Record
                                        </Button>
                                    </Popconfirm>
                                )}
                                {formValues?.engineer_of_record?.update_timestamp && (
                                    <Typography.Paragraph style={{ textAlign: "right" }}>
                                        <b>Last Updated</b>
                                        <br />
                                        {formatDateTime(formValues.engineer_of_record.update_timestamp)}
                                    </Typography.Paragraph>
                                )}
                            </Row>
                        </Col>
                    </Row>

                    {canEditTSFAndEditMode && (
                        <div>
                            {(formValues?.engineer_of_record?.party_guid ? (
                                <Alert
                                    description="Assigning a new Engineer of Record will replace the current Engineer of Record and set the previous Engineer of Record’s status to inactive."
                                    showIcon
                                    type="info"
                                    message={""}
                                />
                            ) : (
                                <Alert
                                    description="Assigning a new Engineer of Record (EoR) will replace the current listed contact and set their status to Inactive. When a new EoR is assigned, a notification will be sent to the Ministry of changes in the record, and must include an acknowledgement by the EoR to be active."
                                    showIcon
                                    type="info"
                                    message={""}
                                />
                            ))}

                            {hasPendingEOR && isCore && (
                                <Alert
                                    description="An Engineer of Record for this facility is awaiting Ministry acknowledgment below. Please contact the mine directly for any issues."
                                    showIcon
                                    type="warning"
                                    message={""}
                                />
                            )}

                            {isNumber(daysToEORExpiry) && daysToEORExpiry >= 0 && daysToEORExpiry <= 60 && (
                                <Alert
                                    message="Engineer of Record will Expire within 60 Days"
                                    description="To be in compliance, you must have a current, Ministry-acknowledged Engineer of Record on file."
                                    showIcon
                                    type="warning"
                                />
                            )}

                            {isNumber(daysToEORExpiry) && daysToEORExpiry < 0 && (
                                <Alert
                                    message="No Engineer of Record"
                                    description="To be in compliance, you must have a current, Ministry-acknowledged Engineer of Record on file."
                                    showIcon
                                    type="error"
                                />
                            )}
                        </div>
                    )}

                    <Typography.Title level={4} className="margin-large--top">
                        Contact Information
                    </Typography.Title>

                    {formValues?.engineer_of_record?.party_guid ? (
                        <ContactDetails contact={formValues.engineer_of_record.party} />
                    ) : (
                        <Row justify="center">
                            <Col span={24}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    imageStyle={{ transform: "scale(1.5)" }}
                                    description={false}
                                />
                            </Col>

                            <Typography.Paragraph>No Data</Typography.Paragraph>
                        </Row>
                    )}
                    {currentEor && currentEor.documents.length > 0 && (
                        <div>
                            <Typography.Title level={4} className="margin-large--top">
                                Acceptance Letter
                            </Typography.Title>
                            <CoreTable
                                columns={columns(LinkButton)}
                                dataSource={currentEor.documents}
                                emptyText="This Engineer of Record does not currently have any documents"
                            />
                        </div>
                    )}

                    {canEditTSFAndEditMode && !formValues?.engineer_of_record?.mine_party_appt_guid && (
                        <>
                            <div className="margin-large--top margin-large--bottom">
                                <Typography.Title level={4}>
                                    {!fieldsDisabled ? "Upload Acceptance Letter *" : "Upload Acceptance Letter"}
                                </Typography.Title>
                                <Typography.Text>
                                    Letter must be officially signed. A notification will be sent to the Mine Manager
                                    upon upload.
                                </Typography.Text>
                            </div>
                            <Field
                                name="engineer_of_record.eor_document_guid"
                                id="engineer_of_record.eor_document_guid"
                                onFileLoad={onFileLoad}
                                onRemoveFile={onRemoveFile}
                                validate={!fieldsDisabled && [required]}
                                component={FileUpload}
                                disabled={fieldsDisabled}
                                uploadUrl={MINE_PARTY_APPOINTMENT_DOCUMENTS(mineGuid)}
                                acceptedFileTypesMap={{ ...PDF }}
                                labelIdle='<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><br>
                <div>Accepted formats: pdf</div>'
                                allowRevert
                            />
                        </>
                    )}

                    <Typography.Title level={4} className="margin-large--top">
                        Engineer of Record Term
                    </Typography.Title>
                    <Typography.Paragraph>
                        Enter the start, and if known, the end date of the Engineer of Record including a
                        termination date if applicable.
                    </Typography.Paragraph>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Field
                                id="engineer_of_record.start_date"
                                name="engineer_of_record.start_date"
                                label="Start Date"
                                disabled={fieldsDisabled}
                                component={RenderDate}
                                required={!fieldsDisabled}
                                validate={
                                    !fieldsDisabled && [required, dateNotInFuture, validateEorStartDateOverlap]
                                }
                            />
                        </Col>
                        <Col span={12}>
                            <Field
                                id="engineer_of_record.end_date"
                                name="engineer_of_record.end_date"
                                label="End Date"
                                disabled={fieldsDisabled}
                                validate={!fieldsDisabled && [dateInFuture]}
                                component={RenderDate}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <PartyAppointmentTable
                        canEditTSF={canEditTSFAndEditMode}
                    />
                </Col>
            </Row>
        </>
    );
};

export default EngineerOfRecord;