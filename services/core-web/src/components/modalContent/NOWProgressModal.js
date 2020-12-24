import React from "react";
import PropTypes from "prop-types";
import { Alert, Popconfirm, Button } from "antd";
import Highlight from "react-highlighter";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import PreDraftPermitForm from "@/components/Forms/permits/PreDraftPermitForm";
import { getDropdownPermitAmendmentTypeOptions } from "@common/selectors/staticContentSelectors";

const propTypes = {
  title: PropTypes.string,
  closeModal: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
  tabCode: PropTypes.string.isRequired,
  trigger: PropTypes.string.isRequired,
  handleProgress: PropTypes.func.isRequired,
  isAmendment: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  isCoalOrMineral: PropTypes.bool.isRequired,
  permitAmendmentTypeDropDownOptions: CustomPropTypes.options.isRequired,
  permitAmendmentType: PropTypes.string,
};

const defaultProps = {
  title: "",
  permitAmendmentType: "",
};

export const NOWProgressModal = (props) => (
  <div>
    {props.trigger === "Start" && (
      <>
        <p>
          Starting <Highlight search={props.tab}>{props.tab}</Highlight> allows you to begin the{" "}
          <Highlight search={props.tab}>{props.tab}</Highlight> process.
        </p>
        <br />
        <p>
          While in progress, You can make any necessary changes to this section of the application.
        </p>
        <br />
        <p>
          Click &quot;Complete {props.tab}&quot; when you are finished. If you need to make any
          changes later, click &quot;Resume {props.tab}&quot;.
        </p>
        <br />
        <p>
          Are you ready to begin <Highlight search={props.tab}>{props.tab}</Highlight>?
        </p>
        <br />
        {props.tabCode === "DFT" && (
          <>
            {props.isAmendment && `Please select the permit that this amendment is for.*`}
            {!props.isAmendment &&
              props.isCoalOrMineral &&
              `Please check the box below if this is an exploratory permit.*`}
            <PreDraftPermitForm
              initialValues={{
                is_exploration: false,
                permit_amendment_type_code: props.permitType,
              }}
              permits={props.permits}
              isAmendment={props.isAmendment}
              isCoalOrMineral={props.isCoalOrMineral}
              permitAmendmentTypeDropDownOptions={props.permitAmendmentTypeDropDownOptions}
              permitType={props.permitAmendmentType}
            />
          </>
        )}
      </>
    )}
    {props.trigger === "Complete" && (
      <>
        <Alert
          description={`If you need to make changes or add documentation later, click 'Resume ${props.tab}'.`}
          type="info"
          showIcon
        />
        <br />
        <p>
          Are you sure you would like to complete the{" "}
          <Highlight search={props.tab}>{props.tab}</Highlight> process?
        </p>
        <br />
      </>
    )}
    {props.trigger === "Resume" && (
      <>
        <p>
          Are you sure you would like to resume the{" "}
          <Highlight search={props.tab}>{props.tab}</Highlight> process?
        </p>
        <br />
      </>
    )}
    <br />
    <br />
    <div className="right center-mobile bottom">
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={() => props.closeModal()}
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
        <Button
          type="primary"
          onClick={() =>
            props.handleProgress(
              props.tabCode,
              props.trigger,
              props.isAmendment,
              props.permitAmendmentType
            )
          }
        >
          {props.title}
        </Button>
      </AuthorizationWrapper>
    </div>
  </div>
);

NOWProgressModal.propTypes = propTypes;
NOWProgressModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  preDraftFormValues: getFormValues(FORM.PRE_DRAFT_PERMIT)(state),
  permitAmendmentTypeDropDownOptions: getDropdownPermitAmendmentTypeOptions(state),
});
export default connect(mapStateToProps, null)(NOWProgressModal);
