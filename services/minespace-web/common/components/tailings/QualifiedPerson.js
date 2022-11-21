import * as PropTypes from "prop-types";

import { Alert, Button, Col, Empty, Popconfirm, Row, Typography } from "antd";
import { Field, change, getFormValues } from "redux-form";
import React, { useContext } from "react";
import { closeModal, openModal } from "@common/actions/modalActions";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";

import { PlusCircleFilled } from "@ant-design/icons";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  required,
  dateNotInFuture,
  dateInFuture,
  validateDateRanges,
} from "@common/utils/Validate";
import ContactDetails from "@common/components/ContactDetails";
import TailingsContext from "@common/components/tailings/TailingsContext";
import moment from "moment";

const propTypes = {
  change: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  partyRelationships: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  mineGuid: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  isCore: PropTypes.bool,
};

const defaultProps = {
  loading: false,
  isCore: false,
};

export const QualifiedPerson = (props) => {
  const { isCore, mineGuid } = props;
  const { renderConfig, addContactModalConfig, tsfFormName } = useContext(TailingsContext);

  const handleCreateQP = (value) => {
    console.log("submitted value", value);
    props.change(tsfFormName, "qualified_person.party_guid", value.party_guid);
    props.change(tsfFormName, "qualified_person.party", value);
    props.change(tsfFormName, "qualified_person.start_date", null);
    props.change(tsfFormName, "qualified_person.end_date", null);
    props.change(tsfFormName, "qualified_person.mine_party_appt_guid", null);
    props.closeModal();
  };

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
            "TQP",
            true
        )?.start_date || undefined
    );
  };

  return (
      <Row className="tailings-section">
        <Col span={24}>
          <Row justify="space-between" align="middle">
            <Col span={14}>
              <Typography.Title level={3} className="tailings-section-title">
                Qualified Person
              </Typography.Title>
            </Col>
            {isCore ? (
                <Col span={10}>
                  <Row justify="space-between" align="middle" gutter={65}>
                    <Col span={12}>
                      <Popconfirm
                          placement="top"
                          title="Once acknowledged by the Ministry, assigning a new Qualified Person will replace the current one and set the previous status to inactive. Continue?"
                          okText="Yes"
                          cancelText="No"
                          onConfirm={openCreateQPModal}
                      >
                        <Button style={{ whiteSpace: "normal", height: "auto" }} type="primary">
                      <span>
                        <PlusCircleFilled className="margin-medium--right" />
                        Update Qualified Person
                      </span>
                        </Button>
                      </Popconfirm>
                    </Col>
                    <Col style={{ textAlign: "right" }}>
                      <Typography.Paragraph strong>Last Updated</Typography.Paragraph>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        {moment(props.formValues?.qualified_person.update_timestamp).format(
                            "DD-MM-YYYY H:mm"
                        )}
                      </Typography.Paragraph>
                    </Col>
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
                  description="Assigning a new Qualified Person will replace the current QP and set the previous QP’s status to inactive."
                  showIcon
                  type="info"
              />
          ) : (
              <Alert
                  description="There's no Qualified Person (EOR) on file for this facility. Click above to assign a new QP."
                  showIcon
                  type="info"
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
            QP Term
          </Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Field
                  id="qualified_person.start_date"
                  name="qualified_person.start_date"
                  label="Start Date"
                  disabled={
                      !!props.formValues?.qualified_person?.mine_party_appt_guid ||
                      !props.formValues?.qualified_person?.party_guid ||
                      props.loading
                  }
                  component={renderConfig.DATE}
                  validate={[required, dateNotInFuture, validateQPStartDateOverlap]}
              />
            </Col>
            <Col span={12}>
              <Field
                  id="qualified_person.end_date"
                  name="qualified_person.end_date"
                  label="End Date (Optional)"
                  disabled={
                      !!props.formValues?.qualified_person?.mine_party_appt_guid ||
                      !props.formValues?.qualified_person?.party_guid ||
                      props.loading
                  }
                  validate={[dateInFuture]}
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

QualifiedPerson.propTypes = propTypes;
QualifiedPerson.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(QualifiedPerson);
