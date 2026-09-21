import React, { FC, useState } from "react";
import { Button, Col, Row } from "antd";
import UpdateNOWInspectorsForm from "@/components/Forms/noticeOfWork/UpdateNOWInspectorsForm";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import { EDIT_OUTLINE } from "@/constants/assets";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { IGroupedDropdownList, INoticeOfWork, IOption } from "@mds/common/interfaces";

interface AssignInspectorsProps {
  noticeOfWork: INoticeOfWork;
  inspectors: (IOption | IGroupedDropdownList)[];
  consultationAdvisors: (IOption | IGroupedDropdownList)[];
  handleUpdateInspectors: (values: any, callback: () => void) => void | Promise<any>;
  title: string;
  isEditMode?: boolean;
  isAdminView?: boolean;
  isLoaded: boolean;
}

const AssignInspectors: FC<AssignInspectorsProps> = (props) => {
  const [isEditMode, setEditMode] = useState(props.isEditMode);
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
            <UpdateNOWInspectorsForm
              initialValues={{
                lead_inspector_party_guid: props.noticeOfWork.lead_inspector_party_guid,
                issuing_inspector_party_guid: props.noticeOfWork.issuing_inspector_party_guid,
                consultation_advisor_party_guid: props.noticeOfWork.consultation_advisor_party_guid,
              }}
              noticeOfWork={props.noticeOfWork}
              inspectors={props.inspectors}
              consultationAdvisors={props.consultationAdvisors}
              onSubmit={(values) => props.handleUpdateInspectors(values, () => setEditMode(false))}
              title={props.title}
              isAdminView={props.isAdminView}
              isEditMode={isEditMode}
              setEditMode={setEditMode}
            />
          </div>
        </Col>
      </Row>
    </LoadingWrapper>
  );
};

export default AssignInspectors;
