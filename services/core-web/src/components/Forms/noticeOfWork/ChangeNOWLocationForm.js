import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { formValueSelector } from "redux-form";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import MineCard from "@/components/mine/NoticeOfWork/MineCard";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import EditNOWMineAndLocation from "@/components/Forms/noticeOfWork/EditNOWMineAndLocation";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  title: PropTypes.string.isRequired,
  locationOnly: PropTypes.bool,
  mine: CustomPropTypes.mine,
  latitude: PropTypes.string.isRequired,
  longitude: PropTypes.string.isRequired,
};

const defaultProps = {
  locationOnly: false,
  mine: {},
};

const selector = formValueSelector(FORM.CHANGE_NOW_LOCATION);
export class ChangeNOWLocationForm extends Component {
  state = { submitting: false };

  handleFormSubmit = (values) => {
    this.setState({ submitting: true });
    this.props.onSubmit(values);
  };

  render() {
    const additionalPin =
      this.props.latitude && this.props.longitude
        ? [this.props.latitude, this.props.longitude]
        : [];
    return (
      <FormWrapper
        name={FORM.CHANGE_NOW_LOCATION}
        initialValues={this.props.initialValues}
        isModal
        onSubmit={this.handleFormSubmit}>
        <EditNOWMineAndLocation
          locationOnly
          latitude={this.props.latitude}
          longitude={this.props.longitude}
        />
        {this.props.locationOnly && (
          <MineCard mine={this.props.mine} additionalPin={additionalPin} />
        )}
        <div className="right center-mobile">
          {this.props.locationOnly && (
            <>
              <RenderCancelButton />
              <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                <RenderSubmitButton buttonText={this.props.title} disabled={this.state.submitting} disableOnClean={false} />
              </AuthorizationWrapper>
            </>
          )}
        </div>
      </FormWrapper>
    );
  }
}

ChangeNOWLocationForm.propTypes = propTypes;
ChangeNOWLocationForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    latitude: selector(state, "latitude"),
    longitude: selector(state, "longitude"),
  }))
)(ChangeNOWLocationForm);
