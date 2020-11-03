import React from "react";
import { Col, Row } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import UpdateNOWLeadInspectorForm from "@/components/Forms/noticeOfWork/UpdateNOWLeadInspectorForm";

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  handleUpdateLeadInspector: PropTypes.func.isRequired,
};

const AssignLeadInspector = (props) => {
  return (
    <div>
      <Row gutter={16}>
        <Col span={24}>
          <UpdateNOWLeadInspectorForm
            initialValues={{
              lead_inspector_party_guid: props.noticeOfWork.lead_inspector_party_guid,
            }}
            inspectors={props.inspectors}
            setLeadInspectorPartyGuid={props.setLeadInspectorPartyGuid}
            onSubmit={props.handleUpdateLeadInspector}
            title="Assign Lead Inspector"
          />
        </Col>
      </Row>
    </div>
  );
};

AssignLeadInspector.propTypes = propTypes;

export default AssignLeadInspector;
