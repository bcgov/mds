import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "@/utils/helpers";

const propTypes = {
  children: PropTypes.objectOf(PropTypes.any).isRequired,
  author: PropTypes.string.isRequired,
  datetime: PropTypes.string.isRequired,
  actions: PropTypes.objectOf(PropTypes.any),
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
          props.actions.map((action) => (
            <span className="ant-comment-content-author-name">{action}</span>
          ))}
      </div>
      <div className="ant-comment-content-author">
        <span className="ant-comment-content-author-name">{props.author}</span>
        {props.datetime && (
          <span className="ant-comment-content-author-time">{formatDate(props.datetime)}</span>
        )}
      </div>
    </div>
  </React.Fragment>
);

Comment.propTypes = propTypes;
Comment.defaultProps = defaultProps;

export default Comment;
