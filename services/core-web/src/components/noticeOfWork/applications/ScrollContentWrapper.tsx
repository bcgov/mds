import React, { FC, useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { includes, isEmpty } from "lodash";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, Popconfirm } from "antd";
import { change, getFormValues } from "redux-form";
import { TRASHCAN } from "@/constants/assets";
import * as FORM from "@/constants/forms";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { IimportedNOWApplication } from "@mds/common";

import NullScreen from "@/components/common/NullScreen";

/**
 * @constant ScrollContentWrapper renders react children with an active indicator if the id is in the url.
 */

interface ScrollContentWrapperProps extends RouteComponentProps {
  id: string;
  children: React.ReactNode;
  title: string;
  history: any;
  showContent?: boolean;
  data?: any;
  isViewMode?: boolean;
  change?: (form: string, field: string, value: any) => void;
  formValues?: IimportedNOWApplication;
  isActive?: boolean;
  isLoaded?: boolean;
}

const defaultProps = {
  showContent: true,
  data: undefined,
  isViewMode: true,
  isActive: false,
  isLoaded: true,
};

export const ScrollContentWrapper: FC<ScrollContentWrapperProps> = (props) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (props.data !== undefined && isEmpty(props.data)) {
      // setIsVisible(false);
    }
  }, []);

  const enableContent = () => {
    setIsVisible(true);
  };

  const clearContent = () => {
    const formSection = props.id.replace(/-/g, "_");
    const data = props.formValues[formSection];

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

    props.change(FORM.EDIT_NOTICE_OF_WORK, formSection, {
      state_modified: "delete",
      ...data,
    });

    setIsVisible(false);
  };

  const renderCorrectView = () => {
    return isVisible ? (
      <span>{props.children}</span>
    ) : (
      <div>
        <NullScreen type="add-now-activity" message={props.title} />
        <div className="null-screen">
          {!props.isViewMode && (
            <Button type="primary" onClick={() => enableContent()}>
              Add Activity
            </Button>
          )}
        </div>
      </div>
    );
  };

  const isActive = () => {
    const currentActiveLink =
      props.history && props.history.location && props.history.location.state
        ? props.history.location.state.currentActiveLink
        : undefined;
    const isActiveLink = includes(currentActiveLink, props.id) || props.isActive;
    return isActiveLink ? "circle purple" : "circle grey";
  };

  if (!props.showContent) {
    return <div />;
  }

  return (
    <div className="scroll-wrapper">
      <div className="inline-flex">
        <div className={isActive()} />
        <div id={props.id}>
          <div className="scroll-wrapper--title">
            <h3>{props.title}</h3>
          </div>
        </div>
        {!props.isViewMode && props.showContent && isVisible && (
          <div title="remove">
            <Popconfirm
              placement="left"
              title={`Are you sure you want to remove the activity ${props.title}? You must save the form to commit these changes.`}
              okText="Yes"
              cancelText="No"
              onConfirm={() => clearContent()}
            >
              <Button type="primary" size="small" ghost>
                <img src={TRASHCAN} alt="Remove Activity" />
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
      <div className="scroll-wrapper--border">
        <LoadingWrapper condition={props.isLoaded}>
          <div className="scroll-wrapper--body">{renderCorrectView()}</div>
        </LoadingWrapper>
      </div>
    </div>
  );
};

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

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ScrollContentWrapper) as FC<
    ScrollContentWrapperProps
  >
);
