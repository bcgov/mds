import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Spin, List, Button, Popconfirm } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { USER_ROLES } from "@mds/common";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import CommentEditor from "@/components/common/comments/CommentEditor";
import Comment from "@/components/common/comments/Comment";
import * as Style from "@/constants/styles";
import { TRASHCAN } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  loading: PropTypes.bool,
  renderEditor: PropTypes.bool,
  comments: PropTypes.arrayOf(CustomPropTypes.mineComment).isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  deletePermission: PropTypes.string,
  createPermission: PropTypes.string,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
};

const defaultProps = {
  renderEditor: false,
  loading: false,
  deletePermission: null,
  createPermission: null,
  onChange: () => {},
  onSubmit: () => {},
  onRemove: () => {},
};

export const CommentPanel = (props) => {
  const createPermission = props.userRoles.includes(USER_ROLES[props?.createPermission])
    ? props.createPermission
    : null;

  return (
    <React.Fragment>
      {!props.loading ? (
        <List
          className="comment-list"
          itemLayout="horizontal"
          dataSource={props.comments}
          locale={{ emptyText: "No Data Yet" }}
          renderItem={(item) => {
            const deletePermission = props.userRoles.includes(USER_ROLES[props?.deletePermission])
              ? props.deletePermission
              : Permission.ADMIN;

            return (
              <li key={item.key}>
                <div className="inline-flex">
                  <div className="flex-4">
                    <Comment author={item.author} datetime={item.datetime} actions={item.actions}>
                      {item.content}
                    </Comment>
                  </div>
                  <AuthorizationWrapper permission={deletePermission}>
                    <Popconfirm
                      placement="topLeft"
                      title="Are you sure you want to delete this comment?"
                      onConfirm={() => props.onRemove(item.key)}
                      okText="Delete"
                      cancelText="Cancel"
                    >
                      <Button ghost type="primary">
                        <img name="remove" src={TRASHCAN} alt="Remove User" />
                      </Button>
                    </Popconfirm>
                  </AuthorizationWrapper>
                </div>
              </li>
            );
          }}
        />
      ) : (
        <div className="center margin-xlarge">
          <Spin
            id="spinner"
            indicator={<LoadingOutlined style={{ fontSize: 30, color: Style.COLOR.mediumGrey }} />}
          />
        </div>
      )}
      {props.renderEditor && (
        <CommentEditor
          addCommentPermission={createPermission}
          onChange={props.onChange}
          onSubmit={props.onSubmit}
        />
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

CommentPanel.defaultProps = defaultProps;
CommentPanel.propTypes = propTypes;

export default connect(mapStateToProps)(CommentPanel);
