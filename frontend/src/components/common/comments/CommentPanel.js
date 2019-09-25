import React from "react";
import PropTypes from "prop-types";

import { Spin, List, Icon } from "antd";

import CommentEditor from "./CommentEditor";

const propTypes = {
  loading: PropTypes.bool.isRequired,
  renderAdd: PropTypes.bool,
  comments: PropTypes.arrayOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
};

const defaultProps = {
  renderAdd: true,
  onChange: () => {},
  onSubmit: () => {},
};

const Comment = (props) => (
  <React.Fragment>
    <div className="speech-bubble">
      {props.content}
      <div class="speech-bubble-arrow"></div>
    </div>
    <div className="ant-comment-content padding-md--bottom">
      <div className="ant-comment-content-author flex-end">
        <span className="ant-comment-content-author-name">{props.author}</span>
        <span className="ant-comment-content-author-time">{props.datetime}</span>
      </div>
    </div>
  </React.Fragment>
);

const CommentPanel = (props) => (
  <React.Fragment>
    {!props.loading ? (
      <List
        className="comment-list"
        itemLayout="horizontal"
        dataSource={props.comments}
        locale={{ emptyText: <Icon /> }}
        renderItem={(item) => (
          <li key={item.key}>
            <Comment author={item.author} datetime={item.datetime} content={item.content} />
          </li>
        )}
      />
    ) : (
      <Spin />
    )}
    {props.renderAdd && <CommentEditor onChange={props.onChange} onSubmit={props.onSubmit} />}
  </React.Fragment>
);

CommentPanel.defaultProps = defaultProps;
CommentPanel.propTypes = propTypes;

export default CommentPanel;
