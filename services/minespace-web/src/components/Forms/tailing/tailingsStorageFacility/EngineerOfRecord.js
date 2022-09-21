import React from "react";
import { Alert, Col, Row, Typography, Button, Popconfirm, Empty } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import { change, Field, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { required } from "@common/utils/Validate";
import * as PropTypes from "prop-types";
import { closeModal, openModal } from "@common/actions/modalActions";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { modalConfig } from "@/components/modalContent/config";

import ContactDetails from "@/components/common/ContactDetails";
import { tailingsStorageFacility as TSFType } from "@/customPropTypes/tailings";

const propTypes = {
  change: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(TSFType).isRequired,
};

export const EngineerOfRecord = (props) => {
  const handleCreateEOR = (value) => {
    props.change(
      FORM.ADD_TAILINGS_STORAGE_FACILITY,
      "engineer_of_record.party_guid",
      value.party_guid
    );
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.party", value);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.start_date", null);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.end_date", null);
    props.change(
      FORM.ADD_TAILINGS_STORAGE_FACILITY,
      "engineer_of_record.mine_party_appt_guid",
      null
    );
    props.closeModal();
  };

  const openCreateEORModal = (event) => {
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleCreateEOR,
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
          title="Once acknowledged by the Ministry, assigning a new Engineer of Record will replace the current one and set the previous status to inactive. Continue?"
          okText="Yes"
          cancelText="No"
          onConfirm={openCreateEORModal}
        >
          <Button style={{ display: "inline", float: "right" }} type="primary">
            <PlusCircleFilled />
            Assign a new Engineer of Record
          </Button>
        </Popconfirm>

        <Typography.Title level={3}>Engineer of Record</Typography.Title>

        {props.formValues?.engineer_of_record?.party_guid ? (
          <Alert
            description="Assigning a new Engineer of Record will replace the current EOR and set the previous EOR’s status to inactive."
            showIcon
            type="info"
          />
        ) : (
          <Alert
            description="There's no Engineer of Record (EOR) on file for this facility. Click above to assign a new EoR. A notification will be sent to the Ministry whereby their acknowledgment is required before the EoR is considered Active."
            showIcon
            type="info"
          />
        )}
        <Typography.Title level={4} className="margin-large--top">
          Contact Information
        </Typography.Title>

        {props.formValues?.engineer_of_record?.party_guid ? (
          <ContactDetails contact={props.formValues.engineer_of_record.party} />
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
          EOR Term
        </Typography.Title>
        <Row gutter={16}>
          <Col span={12}>
            <Field
              id="engineer_of_record.start_date"
              name="engineer_of_record.start_date"
              label="Start Date"
              disabled={!!props.formValues?.engineer_of_record?.mine_party_appt_guid}
              component={renderConfig.DATE}
              validate={[required]}
            />
          </Col>
          <Col span={12}>
            <Field
              id="engineer_of_record.end_date"
              name="engineer_of_record.end_date"
              label="End Date"
              disabled={!!props.formValues?.engineer_of_record?.mine_party_appt_guid}
              validate={[required]}
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

EngineerOfRecord.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(EngineerOfRecord);
