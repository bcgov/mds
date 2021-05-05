import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { includes, isEmpty } from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, Popconfirm } from "antd";
import { PropTypes } from "prop-types";
import { change, getFormValues } from "redux-form";
import CustomPropTypes from "@/customPropTypes";
import { TRASHCAN } from "@/constants/assets";
import * as FORM from "@/constants/forms";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

import NullScreen from "@/components/common/NullScreen";

/**
 * @constant ScrollContentWrapper renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  history: PropTypes.shape({
    location: PropTypes.shape({ state: PropTypes.shape({ currentActiveLink: PropTypes.string }) }),
  }).isRequired,
  showContent: PropTypes.bool,
  data: PropTypes.objectOf(PropTypes.any),
  isViewMode: PropTypes.bool,
  change: PropTypes.func.isRequired,
  formValues: CustomPropTypes.importedNOWApplication.isRequired,
  isActive: PropTypes.bool,
  isLoaded: PropTypes.bool,
};

const defaultProps = {
  showContent: true,
  data: undefined,
  isViewMode: true,
  isActive: false,
  isLoaded: true,
};

export class ScrollContentWrapper extends Component {
  state = { isVisible: true };

  componentDidMount() {
    if (this.props.data !== undefined && isEmpty(this.props.data)) {
      this.setState({ isVisible: false });
    }
  }

  enableContent = () => {
    this.setState({ isVisible: true });
  };

  clearContent = () => {
    const formSection = this.props.id.replace(/-/g, "_");
    const data = this.props.formValues[formSection];

    // delete nested children of activities, if they exist
    if (data.details && data.details.length > 0) {
      data.details = data.details.map((detail) => ({ ...detail, state_modified: "delete" }));
    }

    if (data.equipment && data.equipment.length > 0) {
      data.equipment = data.equipment.map((equipment) => ({
        ...equipment,
        state_modified: "delete",
      }));
    }

    this.props.change(FORM.EDIT_NOTICE_OF_WORK, formSection, {
      state_modified: "delete",
      ...data,
    });

    this.setState({ isVisible: false });
  };

  renderCorrectView = () => {
    return this.state.isVisible ? (
      <span>{this.props.children}</span>
    ) : (
      <div>
        <NullScreen type="add-now-activity" message={this.props.title} />
        <div className="null-screen">
          {!this.props.isViewMode && (
            <Button type="primary" onClick={() => this.enableContent()}>
              Add Activity
            </Button>
          )}
        </div>
      </div>
    );
  };

  render() {
    const isActive = () => {
      const currentActiveLink =
        this.props.history && this.props.history.location && this.props.history.location.state
          ? this.props.history.location.state.currentActiveLink
          : undefined;
      const isActiveLink = includes(currentActiveLink, this.props.id) || this.props.isActive;
      return isActiveLink ? "circle purple" : "circle grey";
    };

    if (!this.props.showContent) {
      return <div />;
    }

    return (
      <div className="scroll-wrapper">
        <div className="inline-flex">
          <div className={isActive()} />
          <div id={this.props.id}>
            <div className="scroll-wrapper--title">
              <h3>{this.props.title}</h3>
            </div>
          </div>
          {!this.props.isViewMode && this.props.showContent && this.state.isVisible && (
            <div name="remove" title="remove">
              <Popconfirm
                placement="left"
                title={`Are you sure you want to remove the activity ${this.props.title}? You must save the form to commit these changes.`}
                okText="Yes"
                cancelText="No"
                onConfirm={() => this.clearContent()}
              >
                <Button type="secondary" size="small" ghost>
                  <img name="remove" src={TRASHCAN} alt="Remove Activity" />
                </Button>
              </Popconfirm>
            </div>
          )}
        </div>
        <div className="scroll-wrapper--border">
          <LoadingWrapper condition={this.props.isLoaded}>
            <div className="scroll-wrapper--body">{this.renderCorrectView()}</div>
          </LoadingWrapper>
        </div>
      </div>
    );
  }
}

ScrollContentWrapper.propTypes = propTypes;
ScrollContentWrapper.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ScrollContentWrapper));
