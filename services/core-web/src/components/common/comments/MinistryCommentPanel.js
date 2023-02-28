import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { Avatar, Divider, Row, Col, Spin, List } from "antd";

import { USER_ROLES } from "@mds/common";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import CommentEditor from "@/components/common/comments/CommentEditor";
import MinistryComment from "@/components/common/comments/MinistryComment";
import * as Style from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  loading: PropTypes.bool,
  renderEditor: PropTypes.bool,
  comments: PropTypes.arrayOf(CustomPropTypes.mineComment).isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  createPermission: PropTypes.string,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
};

const defaultProps = {
  renderEditor: false,
  loading: false,
  createPermission: null,
  onChange: () => {},
  onSubmit: () => {},
};

export const CommentPanel = (props) => {
  const { comments, createPermission, renderEditor, loading } = props;
  const hasCreatePermission = createPermission
    ? props.userRoles.includes(USER_ROLES[createPermission])
    : true;

  return (
    <>
      {renderEditor && hasCreatePermission && (
        <Row>
          <Col span={2}>
            <Avatar size="small" icon={<UserOutlined />} />
          </Col>
          <Col span={22}>
            <CommentEditor
              addCommentPermission={createPermission}
              onChange={props.onChange}
              onSubmit={props.onSubmit}
            />
            <Divider />
          </Col>
        </Row>
      )}
      {!loading ? (
        <List
          className="comment-list"
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(item) => {
            return (
              <li key={item.key}>
                <div className="inline-flex">
                  <div className="flex-4">
                    <Row>
                      <Col span={2}>
                        <Avatar size="small" icon={<UserOutlined />} />
                      </Col>
                      <Col span={21}>
                        <MinistryComment
                          author={item.author}
                          datetime={item.datetime}
                          actions={item.actions}
                        >
                          {item.content}
                        </MinistryComment>
                      </Col>
                    </Row>
                  </div>
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
    </>
  );
};

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

CommentPanel.defaultProps = defaultProps;
CommentPanel.propTypes = propTypes;

export default connect(mapStateToProps)(CommentPanel);
