import * as PropTypes from "prop-types";

import { Alert, Button, Col, Empty, Popconfirm, Row, Typography } from "antd";
import { Field, change, getFormValues } from "redux-form";
import React from "react";
import { closeModal, openModal } from "@common/actions/modalActions";

import { PlusCircleFilled } from "@ant-design/icons";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { required } from "@common/utils/Validate";
import ContactDetails from "@/components/common/ContactDetails";
import { tailingsStorageFacility as TSFType } from "@/customPropTypes/tailings";
import { modalConfig } from "@/components/modalContent/config";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const propTypes = {
  change: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(TSFType).isRequired,
};

export const QualifiedPerson = (props) => {
  const handleCreateQP = (value) => {
    props.change(
      FORM.ADD_TAILINGS_STORAGE_FACILITY,
      "qualified_person.party_guid",
      value.party_guid
    );
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "qualified_person.party", value);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "qualified_person.start_date", null);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "qualified_person.end_date", null);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "qualified_person.mine_party_appt_guid", null);
    props.closeModal();
  };

  const openCreateQPModal = (event) => {
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleCreateQP,
        onCancel: props.closeModal,
        title: "Select Contact",
      },
      content: modalConfig.ADD_CONTACT,
    });
  };

  return (
    <Row>
      <Col span={24}>
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

        <Typography.Title level={3}>Qualified Person</Typography.Title>

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
              disabled={!!props.formValues?.qualified_person?.mine_party_appt_guid}
              component={renderConfig.DATE}
              validate={[required]}
            />
          </Col>
          <Col span={12}>
            <Field
              id="qualified_person.end_date"
              name="qualified_person.end_date"
              label="End Date"
              disabled={!!props.formValues?.qualified_person?.mine_party_appt_guid}
              validate={[]}
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

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADD_TAILINGS_STORAGE_FACILITY)(state),
});

QualifiedPerson.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(QualifiedPerson);
