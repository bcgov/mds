import { Alert, Button, Col, Empty, Popconfirm, Row, Typography } from "antd";
import { change, Field, getFormValues } from "@mds/common/components/forms/form";
import React, { FC, useContext, useEffect, useState } from "react";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import {
    dateInFuture,
    dateNotInFuture,
    required,
    validateDateRanges,
} from "@mds/common/redux/utils/Validate";
import ContactDetails from "./ContactDetails";
import { TailingsContext } from "@mds/common/components/tailings/TailingsContext";
import moment from "moment";
import { ICreateTailingsStorageFacility } from "@mds/common/interfaces";
import RenderDate from "../forms/RenderDate";
import { FORM } from "@mds/common/constants/forms";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";

interface QualifiedPersonProps {
    mineGuid: string;
    loading?: boolean;
    canEditTSF: boolean;
    isEditMode: boolean;
}

export const QualifiedPerson: FC<QualifiedPersonProps> = (props) => {
    const dispatch = useAppDispatch();
    const { mineGuid, canEditTSF, isEditMode } = props;
    const { addContactModalConfig } = useContext(TailingsContext);
    const tsfFormName = FORM.ADD_TAILINGS_STORAGE_FACILITY;
    const formValues = useAppSelector(getFormValues(tsfFormName)) as ICreateTailingsStorageFacility;
    const partyRelationships = useAppSelector(getPartyRelationships);
    const isCore = useAppSelector(getIsCore);
    const [currentQp, setCurrentQp] = useState(null);

    const canEditTSFAndEditMode = canEditTSF && isEditMode;

    const handleCreateQP = (value) => {
        dispatch(change(tsfFormName, "qualified_person.party_guid", value.party_guid));
        dispatch(change(tsfFormName, "qualified_person.party", value));
        dispatch(change(tsfFormName, "qualified_person.start_date", null));
        dispatch(change(tsfFormName, "qualified_person.end_date", null));
        dispatch(change(tsfFormName, "qualified_person.mine_party_appt_guid", null));
        dispatch(closeModal());
    };

    useEffect(() => {
        if (partyRelationships.length > 0) {
            const activeQp = partyRelationships.find(
                (qp) => qp.mine_party_appt_guid === formValues?.qualified_person?.mine_party_appt_guid
            );
            if (activeQp) {
                setCurrentQp(activeQp);
            }
        }
    }, [partyRelationships]);

    const daysToQPExpiry =
        currentQp?.end_date &&
        moment(currentQp?.end_date).startOf("day").diff(moment().startOf("day"), "days");

    const openCreateQPModal = (event) => {
        event.preventDefault();
        dispatch(openModal({
            props: {
                onSubmit: handleCreateQP,
                title: "Select Contact",
                mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum.TQP,
                mine: mineGuid,
                createPartyOnly: true,
            },
            content: addContactModalConfig,
        }));
    };

    const validateQPStartDateOverlap = (val) => {
        if (formValues?.qualified_person?.mine_party_appt_guid || props.loading) {
            // Skip validation for existing TQPs
            return undefined;
        }

        const existingEors = partyRelationships?.filter(
            (p) =>
                p.mine_party_appt_type_code === "TQP" &&
                p.mine_guid === props.mineGuid &&
                p.related_guid === formValues?.mine_tailings_storage_facility_guid
        );

        return (
            validateDateRanges(
                existingEors || [],
                { ...formValues?.qualified_person, start_date: val },
                "Qualified Person",
                true
            )?.start_date || undefined
        );
    };

    // Enable editing of the QFP when a new EoR party has been selected (party_guid is set),
    // but it has yet to be assigned to the TSF (mine_party_appt_guid is not set).
    const canEditQFP =
        formValues?.qualified_person?.party_guid &&
        !formValues?.qualified_person?.mine_party_appt_guid;

    const fieldsDisabled = !canEditQFP || props.loading || !canEditTSFAndEditMode;

    return (
        <Row>
            <Col span={24}>
                <Row justify="space-between">
                    <Typography.Title level={3}>TSF Qualified Person</Typography.Title>
                    {isCore ? (
                        <Col span={12}>
                            <Row justify="end">
                                {canEditTSFAndEditMode && (
                                    <Popconfirm
                                        placement="top"
                                        title="Once acknowledged by the Ministry, assigning a new Qualified Person will replace the current one and set the previous status to inactive. Continue?"
                                        okText="Yes"
                                        cancelText="No"
                                        onConfirm={openCreateQPModal}
                                    >
                                        <Button style={{ whiteSpace: "normal" }} type="primary">
                                            <PlusCircleFilled />
                                            Update TSF Qualified Person
                                        </Button>
                                    </Popconfirm>
                                )}
                                {formValues?.qualified_person?.update_timestamp && (
                                    <Typography.Paragraph style={{ textAlign: "right" }}>
                                        <b>Last Updated</b>
                                        <br />
                                        {moment(formValues?.qualified_person.update_timestamp).format(
                                            "DD-MM-YYYY H:mm"
                                        )}
                                    </Typography.Paragraph>
                                )}
                            </Row>
                        </Col>
                    ) : (
                        <Col>
                            {canEditTSFAndEditMode && (
                                <Popconfirm
                                    style={{ maxWidth: "150px" }}
                                    placement="top"
                                    title="Once acknowledged by the Ministry, assigning a new Qualified Person will replace the current one and set the previous status to inactive. Continue?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={openCreateQPModal}
                                >
                                    <Button style={{ display: "inline", float: "right" }} type="primary">
                                        <PlusCircleFilled />
                                        Assign a new Qualified Person
                                    </Button>
                                </Popconfirm>
                            )}
                        </Col>
                    )}
                </Row>

                {canEditTSFAndEditMode && (
                    <div>
                        {formValues?.qualified_person?.party_guid ? (
                            <Alert
                                description="Assigning a new Qualified Person will replace the current Qualified Person and set the previous Qualified Person’s status to inactive."
                                showIcon
                                type="info"
                                message={""}
                            />
                        ) : (
                            <Alert
                                description="There is no Qualified Person (QP) on file for this facility. Click above to assign a new Qualified Person."
                                showIcon
                                type="info"
                                message={""}
                            />
                        )}
                        {daysToQPExpiry && daysToQPExpiry < 0 && (
                            <Alert
                                message="The Qualified Person's term has expired."
                                description=""
                                showIcon
                                type="error"
                            />
                        )}
                    </div>
                )}
                <Typography.Title level={4} className="margin-large--top">
                    Contact Information
                </Typography.Title>

                {formValues?.qualified_person?.party_guid ? (
                    <ContactDetails contact={formValues.qualified_person.party} />
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
                <Typography.Title level={4} className="margin-large--top">
                    TSF Qualified Person Term
                </Typography.Title>
                <Row gutter={16}>
                    <Col span={12}>
                        <Field
                            id="qualified_person.start_date"
                            name="qualified_person.start_date"
                            label="Start Date"
                            disabled={fieldsDisabled}
                            component={RenderDate}
                            required={!fieldsDisabled}
                            validate={!fieldsDisabled && [required, dateNotInFuture, validateQPStartDateOverlap]}
                        />
                    </Col>
                    <Col span={12}>
                        <Field
                            id="qualified_person.end_date"
                            name="qualified_person.end_date"
                            label="End Date"
                            disabled={fieldsDisabled}
                            validate={!fieldsDisabled && [dateInFuture]}
                            component={RenderDate}
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default QualifiedPerson;