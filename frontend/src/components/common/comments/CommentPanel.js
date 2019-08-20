import React from "react";
import PropTypes from "prop-types";

import { Spin, Comment, List } from "antd";

import CommentEditor from "./CommentEditor";

const propTypes = {
  loading: PropTypes.bool.isRequired,
  renderAdd: PropTypes.bool,
  comments: PropTypes.arrayOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func,
};

const defaultProps = {
  renderAdd: true,
  onChange: () => {},
};

const CommentPanel = (props) => (
  <React.Fragment>
    {!props.loading ? (
      <List
        className="comment-list"
        header={`${props.comments.length} total comments`}
        itemLayout="horizontal"
        dataSource={props.comments}
        renderItem={(item) => (
          <li key={item.key}>
            <Comment
              actions={item.actions}
              author={item.author}
              content={item.content}
              datetime={item.datetime}
            />
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
