import React, { FC } from "react";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Col, Divider, List, Row, Spin } from "antd";

import CommentEditor from "@/components/common/comments/CommentEditor";
import MinistryComment from "@/components/common/comments/MinistryComment";
import * as Style from "@/constants/styles";
import AuthorizationWrapper from "../wrappers/AuthorizationWrapper";
import { IMinistryComment } from "@mds/common/interfaces/projects/ministryComment.interface";

interface MinistryCommentPanelProps {
  loading: boolean;
  renderEditor: boolean;
  comments: IMinistryComment[];
  createPermission: string;
  onSubmit: (data: any) => void;
  maxLength?: number;
}

export const MinistryCommentPanel: FC<MinistryCommentPanelProps> = ({
  comments,
  createPermission,
  renderEditor,
  loading,
  onSubmit,
  maxLength,
}) => {
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
                maxLength={maxLength}
                addCommentPermission={createPermission}
                onSubmit={onSubmit}
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
                        <MinistryComment author={item.author} datetime={item.datetime}>
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
            indicator={<LoadingOutlined style={{ fontSize: 30, color: Style.COLOR.mediumGrey }} />}
          />
        </div>
      )}
    </>
  );
};

export default MinistryCommentPanel;
