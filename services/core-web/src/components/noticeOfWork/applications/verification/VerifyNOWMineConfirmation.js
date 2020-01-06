import React from "react";
import { bindActionCreators } from "redux";
import { Button, Result, Col, Row } from "antd";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import PropTypes from "prop-types";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import UpdateNOWLeadInspectorForm from "@/components/Forms/noticeOfWork/UpdateNOWLeadInspectorForm";

const propTypes = {
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  updateLeadInspectorFormValues: PropTypes.objectOf(PropTypes.any),
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  handleUpdateLeadInspector: PropTypes.func.isRequired,
};

const defaultProps = {
  updateLeadInspectorFormValues: {},
};

const invalidUpdateLeadInspectorPayload = (values) => !values.lead_inspector_party_guid;

const VerifyNOWMineConfirmation = (props) => {
  return (
    <div className="tab__content">
      <Row>
        <Col lg={{ span: 12, offset: 6 }} md={{ span: 16, offset: 4 }} xs={{ span: 20, offset: 2 }}>
          <Result
            type="info"
            title="You're almost done..."
            subTitle="Please assign a Lead Inspector to continue to Technical Review."
            extra={[
              <UpdateNOWLeadInspectorForm
                initialValues={{
                  lead_inspector_party_guid: props.noticeOfWork.lead_inspector_party_guid,
                }}
                inspectors={props.inspectors}
                setLeadInspectorPartyGuid={props.setLeadInspectorPartyGuid}
              />,
              <Button
                type="primary"
                onClick={props.handleUpdateLeadInspector}
                disabled={invalidUpdateLeadInspectorPayload(props.updateLeadInspectorFormValues)}
              >
                Ready for Technical Review
              </Button>,
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

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

VerifyNOWMineConfirmation.propTypes = propTypes;

VerifyNOWMineConfirmation.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VerifyNOWMineConfirmation);
