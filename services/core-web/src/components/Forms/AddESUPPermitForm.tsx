import React, { Component, useState } from "react";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { remove } from "lodash";

import PropTypes from "prop-types";
import { Field, reduxForm, change, formValueSelector, FormSection } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Divider, Alert, Typography, List, Radio } from "antd";

import * as FORM from "@/constants/forms";
import modalConfig from "../modalContent/config";
import {
  fetchExplosivesPermits,
  createExplosivesPermit,
  updateExplosivesPermit,
  deleteExplosivesPermit,
} from "@common/actionCreators/explosivesPermitActionCreator";

interface AddESUPPermitFormProps {
  isPermitTab: boolean;
  permitPrefix?: string;
  handleSubmit: () => void;
  closeModal: () => void;
  initialValues: Record<string, string>;
  mineGuid: string;
  isProcessed: boolean;
  submitting: boolean;
  mines_permit_guid?: string;
  userRoles: string[];
  openModal: (props: any) => void;
  createExplosivesPermit: Function,
  updateExplosivesPermit: Function,
  fetchExplosivesPermits: Function,
  inspectors: any,
  documentTypeDropdownOptions : any;
}

const AddESUPPermitForm: React.FC<AddESUPPermitFormProps> = (props) => {
  const [radioSelection, setRadioSelection] = useState<any>(props.isPermitTab ? 1 : 2);
  const { closeModal, handleSubmit, mineGuid } = props;

  const handleRadioChange = (e) => {
    console.log('radio checked', e.target.value);
    setRadioSelection(e.target.value);
  };
  
  const handleUpdateExplosivesPermitTest = (values) => {
    const payload = {
      ...values,
    };
    return props
      .updateExplosivesPermit(mineGuid, values.explosives_permit_guid, payload)
      .then(() => {
        props.fetchExplosivesPermits(mineGuid);
        props.closeModal();
      });
  };

  const handleAddExplosivesPermitTest = (values) => {
    const system = values.permit_tab ? "MMS" : "Core";
    const payload = {
      originating_system: system,
      ...values,
    };
    return props.createExplosivesPermit(mineGuid, payload).then(() => {
      props.fetchExplosivesPermits(mineGuid);
      props.closeModal();
    });
  };

  const handleOpenAddExplosivesPermitModalTest = (event: React.MouseEvent<HTMLElement>, permitTab: boolean, record: any | null = null) => {
    console.log(")____________________________")
    const initialValues = record || { permit_tab: permitTab };
    const isProcessed = record && record?.application_status !== "REC";
    

    try{
   
    props.openModal({
      props: {
        onSubmit: record ? handleUpdateExplosivesPermitTest : handleAddExplosivesPermitTest,
        title: "Add Explosives Storage & Use Permit",
        // title: "Add Permit",
        initialValues,
        mineGuid,
        isProcessed,
        isPermitTab: permitTab,
      },
      content: modalConfig.EXPLOSIVES_PERMIT_MODAL,
      width: "75vw",
    });
  }
  catch(e){
    console.log(e)
  }
  };

  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
      <Typography.Title level={3}>Add Permit</Typography.Title>
      <div>
        <Typography.Paragraph>Let's get your permit started, in CORE you can...</Typography.Paragraph>
        <ul>
          <li>
            <Typography.Text strong> * Add an existing permit</Typography.Text>
            <Typography.Text>
              that was previously issued but does not exist in CORE and Minespace. This will help you keep track of your
              past permits and activities.
            </Typography.Text>
          </li>
          <li>
            <Typography.Text strong> * Create a new permit</Typography.Text>
            <Typography.Text>this is meant for new explosive storage and use permits.</Typography.Text>
          </li>
          <li>
            <Typography.Text strong> * Amend an existing permit</Typography.Text>
            <Typography.Text>
              that has already been added to CORE and Minespace. This will allow you to make changes to your permit
              conditions, such as the dates, amount of explosives.</Typography.Text>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="uppercase">Default to "add existing" from permit page / "Create New" from application page</h4>
        <Typography.Text>Select an action below to get started:</Typography.Text>
        <div>
        <Radio.Group
          value={radioSelection}
          onChange={handleRadioChange}>
            <div>
            <Radio value={1}>Add an existing explosive storage and Use permit</Radio><br/>
            <Radio value={2}>Create new explosive storage and use permit</Radio><br/>
            <Radio value={3}>Amend an existing explosive storage and use permit</Radio>
            </div>
        </Radio.Group>
        </div>
      </div>
      <div className="right center-mobile" style={{ paddingTop: "14px" }}>
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          okText="Yes"
          cancelText="No"
          onConfirm={closeModal}
        >
          <Button className="full-mobile">
            Cancel
          </Button>
        </Popconfirm>
        <Button type="primary" onClick={(e) => handleOpenAddExplosivesPermitModalTest(e, props.isPermitTab)}>
          Next
        </Button>
      </div>
    </Form>
  );
};

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(AddESUPPermitForm);
