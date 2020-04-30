import React from "react";
import PropTypes from "prop-types";
import { formatDateTime } from "@common/utils/helpers";

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
  author: PropTypes.string.isRequired,
  datetime: PropTypes.string.isRequired,
  actions: PropTypes.arrayOf(PropTypes.any),
};

const defaultProps = {
  actions: {},
};

const Comment = (props) => (
  <React.Fragment>
    <div className="speech-bubble">
      {props.children}
      <div className="speech-bubble-arrow" />
    </div>
    <div className="ant-comment-content padding-md--bottom inline-flex between">
      <div className="ant-comment-content-author inline-flex flex-flow-column">
        {props.actions &&
          props.actions.map((action, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <span className="ant-comment-content-author-name" key={index}>
              {action}
            </span>
          ))}
      </div>
      <div className="ant-comment-content-author">
        <span className="ant-comment-content-author-name">{props.author}</span>
        {props.datetime && (
          <span className="ant-comment-content-author-time">{formatDateTime(props.datetime)}</span>
        )}
      </div>
    </div>
  </React.Fragment>
);

Comment.propTypes = propTypes;
Comment.defaultProps = defaultProps;

export default Comment;
