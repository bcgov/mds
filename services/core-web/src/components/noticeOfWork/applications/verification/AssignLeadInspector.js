import React, { useState } from "react";
import { Col, Row, Button } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import UpdateNOWLeadInspectorForm from "@/components/Forms/noticeOfWork/UpdateNOWLeadInspectorForm";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import { EDIT_OUTLINE } from "@/constants/assets";

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  handleUpdateLeadInspector: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
  isAdminView: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

const defaultProps = {
  isEditMode: false,
  isAdminView: false,
};

const AssignLeadInspector = (props) => {
  const [isEditMode, setEditMode] = useState(props.isEditMode);
  return (
    <div>
      {!isEditMode && props.isAdminView && (
        <div className="right">
          <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
            <Button type="secondary" onClick={() => setEditMode(true)}>
              <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
              Edit
            </Button>
          </NOWActionWrapper>
        </div>
      )}
      <Row gutter={16}>
        <Col span={24}>
          <div style={isEditMode ? { backgroundColor: "#f3f0f0", padding: "20px" } : {}}>
            <UpdateNOWLeadInspectorForm
              initialValues={{
                lead_inspector_party_guid: props.noticeOfWork.lead_inspector_party_guid,
              }}
              inspectors={props.inspectors}
              setLeadInspectorPartyGuid={props.setLeadInspectorPartyGuid}
              onSubmit={props.handleUpdateLeadInspector}
              title={props.title}
              isAdminView={props.isAdminView}
              isEditMode={isEditMode}
              setEditMode={setEditMode}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

AssignLeadInspector.propTypes = propTypes;
AssignLeadInspector.defaultProps = defaultProps;

export default AssignLeadInspector;
