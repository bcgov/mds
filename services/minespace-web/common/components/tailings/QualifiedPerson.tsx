import { Alert, Button, Col, Empty, Popconfirm, Row, Typography } from "antd";
import { change, ChangeAction, Field, getFormValues } from "redux-form";
import React, { FC, useContext, useEffect, useState } from "react";
import { closeModal, openModal } from "@common/actions/modalActions";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";

import { PlusCircleFilled } from "@ant-design/icons";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
import {
  dateInFuture,
  dateNotInFuture,
  required,
  validateDateRanges,
} from "@common/utils/Validate";
import ContactDetails from "@common/components/ContactDetails";
import TailingsContext from "@common/components/tailings/TailingsContext";
import moment from "moment";

interface QualifiedPersonProps {
  change: (
    field: string,
    value: any,
    touch?: boolean,
    persistentSubmitErrors?: boolean
  ) => ChangeAction;
  openModal: (value: any) => void;
  closeModal: () => void;
  formValues: any;
  partyRelationships: any[];
  mineGuid: string;
  loading?: boolean;
  isCore?: boolean;
}

export const QualifiedPerson: FC<QualifiedPersonProps> = (props) => {
  const { isCore, mineGuid, partyRelationships } = props;
  const { renderConfig, addContactModalConfig, tsfFormName } = useContext(TailingsContext);
  const formValues = useSelector((state) => getFormValues(tsfFormName)(state));
  const [currentQp, setCurrentQp] = useState(null);

  const handleCreateQP = (value) => {
    props.change(tsfFormName, "qualified_person.party_guid", value.party_guid);
    props.change(tsfFormName, "qualified_person.party", value);
    props.change(tsfFormName, "qualified_person.start_date", null);
    props.change(tsfFormName, "qualified_person.end_date", null);
    props.change(tsfFormName, "qualified_person.mine_party_appt_guid", null);
    props.closeModal();
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
    moment(currentQp?.end_date)
      .startOf("day")
      .diff(moment().startOf("day"), "days");

  const openCreateQPModal = (event) => {
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleCreateQP,
        onCancel: props.closeModal,
        title: "Select Contact",
        mine_party_appt_type_code: "TQP",
        partyRelationshipType: "TQP",
        mine: mineGuid,
        createPartyOnly: true,
      },
      content: addContactModalConfig,
    });
  };

  const validateQPStartDateOverlap = (val) => {
    if (props.formValues?.qualified_person?.mine_party_appt_guid || props.loading) {
      // Skip validation for existing TQPs
      return undefined;
    }

    const existingEors = props.partyRelationships?.filter(
      (p) =>
        p.mine_party_appt_type_code === "TQP" &&
        p.mine_guid === props.mineGuid &&
        p.related_guid === props.formValues.mine_tailings_storage_facility_guid
    );

    return (
      validateDateRanges(
        existingEors || [],
        { ...props.formValues?.qualified_person, start_date: val },
        "Qualified Person",
        true
      )?.start_date || undefined
    );
  };

  // Enable editing of the QFP when a new EoR party has been selected (party_guid is set),
  // but it has yet to be assigned to the TSF (mine_party_appt_guid is not set).
  const canEditQFP =
    props.formValues?.qualified_person?.party_guid &&
    !props.formValues?.qualified_person?.mine_party_appt_guid;

  const fieldsDisabled = !canEditQFP || props.loading;

  return (
    <Row>
      <Col span={24}>
        <Row justify="space-between">
          <Typography.Title level={3}>TSF Qualified Person</Typography.Title>
          {isCore ? (
            <Col span={12}>
              <Row justify="end">
                <Popconfirm
                  placement="top"
                  title="Once acknowledged by the Ministry, assigning a new Qualified Person will replace the current one and set the previous status to inactive. Continue?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={openCreateQPModal}
                >
                  <Button style={{ whiteSpace: "normal" }} type="primary">
                    <PlusCircleFilled />
                    Update Qualified Person
                  </Button>
                </Popconfirm>
                {formValues?.qualified_person?.update_timestamp && (
                  <Typography.Paragraph style={{ textAlign: "right" }}>
                    <b>Last Updated</b>
                    <br />
                    {moment(props.formValues?.qualified_person.update_timestamp).format(
                      "DD-MM-YYYY H:mm"
                    )}
                  </Typography.Paragraph>
                )}
              </Row>
            </Col>
          ) : (
            <Col>
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
            </Col>
          )}
        </Row>

        {props.formValues?.qualified_person?.party_guid ? (
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
        <Typography.Title level={4} className="margin-large--top">
          Contact Information
        </Typography.Title>

        {props.formValues?.qualified_person?.party_guid ? (
          <ContactDetails contact={props.formValues.qualified_person.party} />
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
              component={renderConfig.DATE}
              validate={!fieldsDisabled && [required, dateNotInFuture, validateQPStartDateOverlap]}
            />
          </Col>
          <Col span={12}>
            <Field
              id="qualified_person.end_date"
              name="qualified_person.end_date"
              label="End Date (Optional)"
              disabled={fieldsDisabled}
              validate={!fieldsDisabled && [dateInFuture]}
              component={renderConfig.DATE}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      change,
    },
    dispatch
  );

const mapStateToProps = (state, ownProps) => ({
  formValues: getFormValues(ownProps.tsfFormName)(state),
  partyRelationships: getPartyRelationships(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(QualifiedPerson);
