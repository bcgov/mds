import React from "react";
import PropTypes from "prop-types";

import { Comment, List, Tooltip } from "antd";
import CommentEditor from "./CommentEditor";

const propTypes = {
  key: PropTypes.string.isRequired,
  renderAdd: PropTypes.bool,
  comments: PropTypes.arrayOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func,
};

const defaultProps = {
  key: "",
  renderAdd: true,
  onChange: () => {},
};

const CommentPanel = (props) => [
  // <CommentEditor onSubmit={props.onSubmit} submitting={props.submitting} value="" />,

  <List
    className="comment-list"
    header={`${props.comments.length} total comments`}
    itemLayout="horizontal"
    dataSource={props.comments}
    renderItem={(item) => (
      <li>
        <Comment
          key={item.comment}
          actions={item.actions}
          author={item.author}
          content={item.content}
          datetime={item.datetime}
        />
      </li>
    )}
  />,
];

CommentPanel.defaultProps = defaultProps;
CommentPanel.propTypes = propTypes;

export default CommentPanel;
