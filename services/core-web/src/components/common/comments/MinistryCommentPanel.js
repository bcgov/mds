import React from "react";
import PropTypes from "prop-types";
import { UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { Avatar, Divider, Row, Col, Spin, List } from "antd";

import CommentEditor from "@/components/common/comments/CommentEditor";
import MinistryComment from "@/components/common/comments/MinistryComment";
import * as Style from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "../wrappers/AuthorizationWrapper";

const propTypes = {
  loading: PropTypes.bool,
  renderEditor: PropTypes.bool,
  comments: PropTypes.arrayOf(CustomPropTypes.mineComment).isRequired,
  createPermission: PropTypes.string,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
};

const defaultProps = {
  renderEditor: false,
  loading: false,
  createPermission: undefined,
  onChange: () => {},
  onSubmit: () => {},
};

export const MinistryCommentPanel = (props) => {
  const { comments, createPermission, renderEditor, loading } = props;
  return (
    <>
      {renderEditor && (
        <AuthorizationWrapper permission={createPermission}>
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
        </AuthorizationWrapper>
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

MinistryCommentPanel.defaultProps = defaultProps;
MinistryCommentPanel.propTypes = propTypes;

export default MinistryCommentPanel;
