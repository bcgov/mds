import React, { FC } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { includes } from "lodash";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

/**
 * @constant ScrollContentWrapper renders react children with an active indicator if the id is in the url.
 */

interface ScrollContentWrapperProps {
  id: string;
  children: React.ReactNode;
  title: string | React.ReactNode;
  showContent?: boolean;
  isActive?: boolean;
  isLoaded?: boolean;
}

const defaultProps = {
  isActive: false,
  isLoaded: true,
};

export const ScrollContentWrapper: FC<ScrollContentWrapperProps> = (props) => {
  const history = useHistory();
  const location = useLocation();

  const isActive = () => {
    const currentActiveLink = history?.location?.state
      // see ScrollSideMenu for typing of currentActiveLink
      // @ts-ignore
      ? location.state.currentActiveLink
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
        {/* {!props.isViewMode && props.showContent && isVisible && (
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
        )} */}
      </div>
      <div className="scroll-wrapper--border">
        <LoadingWrapper condition={props.isLoaded}>
          <div className="scroll-wrapper--body">{props.children}</div>
        </LoadingWrapper>
      </div>
    </div>
  );
};

ScrollContentWrapper.defaultProps = defaultProps;

export default ScrollContentWrapper;
