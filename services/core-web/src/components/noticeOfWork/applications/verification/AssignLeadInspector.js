import React from "react";
import { Button, Result, Col, Row } from "antd";
import { LikeOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import PropTypes from "prop-types";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import UpdateNOWLeadInspectorForm from "@/components/Forms/noticeOfWork/UpdateNOWLeadInspectorForm";

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  updateLeadInspectorFormValues: PropTypes.objectOf(PropTypes.any),
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  handleUpdateLeadInspector: PropTypes.func.isRequired,
};

const defaultProps = {
  updateLeadInspectorFormValues: {},
};

const invalidUpdateLeadInspectorPayload = (values) => !values.lead_inspector_party_guid;

const AssignLeadInspector = (props) => {
  return (
    <div className="tab__content">
      <Row>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 16, offset: 4 }} xs={{ span: 20, offset: 2 }}>
          <Result
            icon={<LikeOutlined />}
            title="You're almost done..."
            subTitle="Please assign a Lead Inspector to continue to Technical Review."
            extra={[
              <>
                <div className="left">
                  <UpdateNOWLeadInspectorForm
                    initialValues={{
                      lead_inspector_party_guid: props.noticeOfWork.lead_inspector_party_guid,
                    }}
                    inspectors={props.inspectors}
                    setLeadInspectorPartyGuid={props.setLeadInspectorPartyGuid}
                  />
                </div>
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <Button
                    type="primary"
                    className="no-margin center-mobile"
                    onClick={props.handleUpdateLeadInspector}
                    disabled={invalidUpdateLeadInspectorPayload(
                      props.updateLeadInspectorFormValues
                    )}
                  >
                    Assign Lead Inspector
                  </Button>
                </AuthorizationWrapper>
              </>,
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (state) => ({
  updateLeadInspectorFormValues: getFormValues(FORM.UPDATE_NOW_LEAD_INSPECTOR)(state) || {},
});

AssignLeadInspector.propTypes = propTypes;
AssignLeadInspector.defaultProps = defaultProps;

export default connect(mapStateToProps)(AssignLeadInspector);
