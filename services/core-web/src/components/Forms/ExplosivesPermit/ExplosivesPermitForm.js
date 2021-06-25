/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { remove } from "lodash";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { Field, reduxForm, change, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { getNoticeOfWorkList } from "@common/selectors/noticeOfWorkSelectors";
import { required, maxLength, dateNotInFuture, number, lat, lon } from "@common/utils/Validate";
import { resetForm, createDropDownList } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import { getPermits } from "@common/selectors/permitSelectors";
import DocumentCategoryForm from "@/components/Forms/DocumentCategoryForm";
import ExplosivesPermitFileUpload from "@/components/Forms/ExplosivesPermit/ExplosivesPermitFileUpload";
import MagazineForm from "@/components/Forms/ExplosivesPermit/MagazineForm";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mineGuid: PropTypes.string.isRequired,
  permit_guid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  change: PropTypes.func,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication).isRequired,
};

const defaultProps = {
  initialValues: {},
  change,
};

export class ExplosivesPermitForm extends Component {
  state = {
    uploadedFiles: [],
  };

  // File upload handlers
  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ fileName, document_manager_guid });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    const permitDropdown = createDropDownList(this.props.permits, "permit_no", "permit_guid");
    const nowDropdown = createDropDownList(
      this.props.noticeOfWorkApplications,
      "now_number",
      "now_application_guid"
    );
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col md={12} sm={24}>
            {/* <Form.Item>
              <PartySelectField
                id="mine_operator_party_guid"
                name="mine_operator_party_guid"
                label="Mine Operator*"
                partyLabel="permittee"
                validate={[required]}
                allowAddingParties
              />
            </Form.Item> */}
            <Form.Item>
              <Field
                id="permit_guid"
                name="permit_guid"
                placeholder="Select a Permit"
                label="Mines Act Permit*"
                component={renderConfig.SELECT}
                data={permitDropdown}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="now_application_guid"
                name="now_application_guid"
                placeholder="Select a NoW"
                label="Notice of Work number"
                component={renderConfig.SELECT}
                data={nowDropdown}
              />
            </Form.Item>
            {/* <Form.Item>
              <PartySelectField
                id="issuing_inspector_party_guid"
                name="issuing_inspector_party_guid"
                label="Issuing Inspector*"
                partyLabel="permittee"
                validate={[required]}
                allowAddingParties
              />
            </Form.Item> */}
            <Form.Item>
              <Field
                id="application_date"
                name="application_date"
                label="Application Date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
            <Row gutter={6}>
              <Col span={12}>
                <Form.Item>
                  <Field
                    id="latitude"
                    name="latitude"
                    label="Latitude*"
                    validate={[number, maxLength(10), lat]}
                    component={renderConfig.FIELD}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item>
                  <Field
                    id="longitude"
                    name="longitude"
                    label="Longitude*"
                    validate={[number, maxLength(12), lon]}
                    component={renderConfig.FIELD}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* <DocumentCategoryForm /> */}
            <Form.Item label="Select Files/Upload files*">
              <Field
                id="DocumentFileUpload"
                name="DocumentFileUpload"
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                mineGuid={this.props.mineGuid}
                component={ExplosivesPermitFileUpload}
                allowMultiple
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24} className="border--left--layout">
            <MagazineForm />
          </Col>
        </Row>
        <div className="right center-mobile" style={{ paddingTop: "14px" }}>
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            className="full-mobile"
            htmlType="submit"
            loading={this.state.submitting}
          >
            Submit
          </Button>
        </div>
      </Form>
    );
  }
}

ExplosivesPermitForm.propTypes = propTypes;
ExplosivesPermitForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.EXPLOSIVES_PERMIT);
const mapStateToProps = (state) => ({
  permits: getPermits(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.EXPLOSIVES_PERMIT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT),
  })
)(ExplosivesPermitForm);
