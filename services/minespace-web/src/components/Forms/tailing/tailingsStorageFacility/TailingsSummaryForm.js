import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { flattenObject } from "@common/utils/helpers";
import { bindActionCreators, compose } from "redux";
import { isNil } from "lodash";
import {
  arrayPush,
  change,
  formValueSelector,
  getFormSyncErrors,
  getFormValues,
  reduxForm,
} from "redux-form";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Popconfirm, Row } from "antd";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import BasicInformation from "@/components/Forms/tailing/tailingsStorageFacility/BasicInformation";
import EngineerOfRecord from "@/components/Forms/tailing/tailingsStorageFacility/EngineerOfRecord";
import LinkButton from "@/components/common/LinkButton";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";

const propTypes = {
  initialValues: CustomPropTypes.projectSummary.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      tab: PropTypes.string,
    }),
  }).isRequired,
  mines: CustomPropTypes.mine.isRequired,
  submitting: PropTypes.bool.isRequired,
  change: PropTypes.func.isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
  handleTabChange: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.string),
  handleSaveData: PropTypes.func.isRequired,
};

const defaultProps = {
  formValues: {},
  formErrors: {},
};

const tabs = [
  "basic-information",
  "engineer-of-record",
  "qualified-person",
  "registry-document",
  "reports",
  "summary",
];

export const TailingsSummaryForm = (props) => {
  const [tabIndex, setTabIndex] = useState(0);
  const {
    initialValues,
    match,
    submitting,
    handleTabChange,
    formErrors,
    handleSaveData,
    formValues,
  } = props;

  useEffect(() => {
    setTabIndex(tabs.indexOf(match.params.tab));
  }, []);

  useEffect(() => {
    if (tabIndex !== tabs.indexOf(match.params.tab)) {
      setTabIndex(tabs.indexOf(match.params.tab));
    }
  }, [match.params.tab]);

  const renderTabComponent = (tab) =>
    ({
      "basic-information": <BasicInformation initialValues={initialValues} />,
      "engineer-of-record": <EngineerOfRecord initialValues={initialValues} />,
      "qualified-person": <div />,
      "registry-document": <div />,
      reports: <div />,
      summary: <div />,
    }[tab]);
  const isFirst = tabIndex === 0;
  const isLast = tabs.length - 1 === tabIndex;
  const errors = Object.keys(flattenObject(formErrors));
  const disabledButton = errors.length > 0;
  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col span={20}>{renderTabComponent(tabs[tabIndex])}</Col>
        <div className="vertical-tabs--tabpane--actions">
          <Row justify="space-between">
            <Col span={13}>
              <div>
                {!isFirst && (
                  <Button type="secondary" onClick={() => handleTabChange(tabs[tabIndex - 1])}>
                    <LeftOutlined /> Back
                  </Button>
                )}
              </div>
            </Col>

            <Col span={6}>
              <div>
                <AuthorizationWrapper>
                  <LinkButton
                    onClick={(e) =>
                      handleSaveData(
                        e,
                        {
                          formValues,
                          status_code: "DFT",
                        },
                        "Successfully saved a draft Tailings Storage Facility."
                      )
                    }
                    title="Save Draft"
                    disabled={submitting}
                  >
                    Save Draft
                  </LinkButton>
                </AuthorizationWrapper>

                {!isLast && (
                  <Button
                    type="secondary"
                    disabled={disabledButton}
                    onClick={() => handleTabChange(tabs[tabIndex + 1], false)}
                  >
                    Next <RightOutlined />
                  </Button>
                )}
                {isLast && (
                  <>
                    <AuthorizationWrapper>
                      <Popconfirm
                        placement="topRight"
                        title="Are you sure you want to submit your project description to the Province of British Columbia?"
                        onConfirm={(e) =>
                          handleSaveData(
                            e,
                            {
                              ...formValues,
                              status_code: "SUB",
                            },
                            "Successfully submitted a project description to the Province of British Columbia."
                          )
                        }
                        okText="Yes"
                        cancelText="No"
                        disabled={
                          isNil(formValues?.contacts) ||
                          (!isNil(formValues?.contacts) && formValues?.contacts.length === 0)
                        }
                      >
                        <Button
                          type="primary"
                          loading={submitting}
                          disabled={
                            submitting ||
                            isNil(formValues?.contacts) ||
                            (!isNil(formValues?.contacts) && formValues?.contacts.length === 0)
                          }
                        >
                          Submit
                        </Button>
                      </Popconfirm>
                    </AuthorizationWrapper>
                    {(isNil(formValues?.contacts) ||
                      (!isNil(formValues?.contacts) && formValues?.contacts.length === 0)) && (
                      <p className="red">Project Descriptions must have a contact.</p>
                    )}
                  </>
                )}
              </div>
            </Col>
            <Col span={3} />
          </Row>
        </div>
      </Row>
    </Form>
  );
};

TailingsSummaryForm.propTypes = propTypes;
TailingsSummaryForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.ADD_TAILINGS_STORAGE_FACILITY);
const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADD_TAILINGS_STORAGE_FACILITY)(state) || {},
  formErrors: getFormSyncErrors(FORM.ADD_TAILINGS_STORAGE_FACILITY)(state),
  anyTouched: selector(state, "anyTouched"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
      arrayPush,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_TAILINGS_STORAGE_FACILITY,
    touchOnBlur: true,
    touchOnChange: false,
    onSubmit: () => {},
  })
)(withRouter(AuthorizationGuard(Permission.IN_TESTING)(TailingsSummaryForm)));
