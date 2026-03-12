import React, { FC, useState } from "react";
import { Col, Row, Button } from "antd";
import UpdateNOWTierForm from "@/components/Forms/noticeOfWork/UpdateNOWTierForm";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import { EDIT_OUTLINE } from "@/constants/assets";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { INoticeOfWork } from "@mds/common/interfaces";

interface AssignTierProps {
  noticeOfWork: INoticeOfWork;
  handleUpdateTier: (values: any, callback: () => void) => void | Promise<any>;
  title: string;
  isEditMode?: boolean;
  isAdminView?: boolean;
  isLoaded: boolean;
}

const AssignTier: FC<AssignTierProps> = (props) => {
  const [isEditMode, setEditMode] = useState(props.isEditMode ?? false);
  return (
    <LoadingWrapper condition={props.isLoaded}>
      {!isEditMode && props.isAdminView && (
        <div className="right">
          <NOWActionWrapper permission={Permission.EDIT_PERMITS} ignoreDelay>
            <Button type="default" onClick={() => setEditMode(true)}>
              <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
              Edit
            </Button>
          </NOWActionWrapper>
        </div>
      )}
      <Row gutter={16}>
        <Col span={24}>
          <div style={isEditMode ? { backgroundColor: "#f3f0f0", padding: "20px" } : {}}>
            <UpdateNOWTierForm
              initialValues={{
                now_application_tier_code: props.noticeOfWork.now_application_tier_code,
                now_application_tier_description: props.noticeOfWork.now_application_tier_description,
              }}
              noticeOfWork={props.noticeOfWork}
              onSubmit={(values) => props.handleUpdateTier(values, () => setEditMode(false))}
              onCancel={() => setEditMode(false)}
              title={props.title}
              isAdminView={props.isAdminView}
              isEditMode={isEditMode}
            />
          </div>
        </Col>
      </Row>
    </LoadingWrapper>
  );
};

export default AssignTier;
