import React, { FC, useState, useEffect } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Row, Col, Divider, Button, Descriptions, List, Popconfirm, Typography, Badge } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  fetchMineWorkInformations,
  createMineWorkInformation,
  updateMineWorkInformation,
  deleteMineWorkInformation,
} from "@common/actionCreators/workInformationActionCreator";
import * as Strings from "@common/constants/strings";
import { getMineWorkInformations } from "@common/selectors/workInformationSelectors";
import AddButton from "@/components/common/buttons/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { formatDate, formatDateTime } from "@common/utils/helpers";
import { isEmpty } from "lodash";
import { modalConfig } from "@/components/modalContent/config";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import { getWorkInformationBadgeStatusType } from "@/constants/theme";
import { ActionCreator } from "@/interfaces/actionCreator";

interface MineWorkInformationProps {
  mineGuid: string;
  mineWorkInformations: any;
  fetchMineWorkInformations: ActionCreator<typeof fetchMineWorkInformations>;
  createMineWorkInformation: ActionCreator<typeof createMineWorkInformation>;
  updateMineWorkInformation: ActionCreator<typeof updateMineWorkInformation>;
  deleteMineWorkInformation: ActionCreator<typeof deleteMineWorkInformation>;
  openModal: typeof openModal;
  closeModal: typeof closeModal;
}

export const MineWorkInformation: FC<MineWorkInformationProps> = (props) => {
  const [isLoaded, setisLoaded] = useState(false);
  const [showAll, setshowAll] = useState(false);

  const submitAddEditMineWorkInformationForm = (mineWorkInformationGuid) => (values) => {
    const action = mineWorkInformationGuid
      ? props.updateMineWorkInformation(props.mineGuid, mineWorkInformationGuid, values)
      : props.createMineWorkInformation(props.mineGuid, values);
    return action.then(() => {
      setisLoaded(false);
      return props
        .fetchMineWorkInformations(props.mineGuid)
        .then(() => props.closeModal())
        .finally(() => setisLoaded(true));
    });
  };

  const openAddEditMineWorkInformationModal = (mineWorkInformation = null) => {
    const title = mineWorkInformation
      ? "Update Mine Work Information"
      : "Add Mine Work Information";
    return props.openModal({
      props: {
        title,
        initialValues: mineWorkInformation,
        mineWorkInformationGuid: mineWorkInformation?.mine_work_information_guid,
        onSubmit: submitAddEditMineWorkInformationForm(
          mineWorkInformation?.mine_work_information_guid
        ),
      },
      content: modalConfig.ADD_MINE_WORK_INFORMATION,
      width: "50vw",
    });
  };

  const deleteMineWorkInformation = (mineWorkInformationGuid) => {
    setisLoaded(false);
    return props
      .deleteMineWorkInformation(props.mineGuid, mineWorkInformationGuid)
      .then(() => props.fetchMineWorkInformations(props.mineGuid))
      .finally(() => setisLoaded(true));
  };

  useEffect(() => {
    props.fetchMineWorkInformations(props.mineGuid).then(() => setisLoaded(true));
  }, []);

  const renderWorkInfo = (info) => (
    <List.Item>
      <Row>
        <Col span={22}>
          <Descriptions column={5} colon={false}>
            <Descriptions.Item label="Work Status">
              <Badge
                status={getWorkInformationBadgeStatusType(info.work_status)}
                text={info.work_status}
              />
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  Work Start Date
                  <CoreTooltip
                    title={
                      <>
                        <Typography.Text strong underline>
                          Notice To Start Work
                        </Typography.Text>
                        <br />
                        <Typography.Text>
                          6.2.1 The manager shall give 10 days’ notice to an inspector of intention
                          to start [any mining activity] in, at, or about a mine, including seasonal
                          reactivation.
                        </Typography.Text>
                      </>
                    }
                  />
                </>
              }
            >
              {formatDate(info.work_start_date) || Strings.NOT_APPLICABLE}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  Work Stop Date
                  <CoreTooltip
                    title={
                      <>
                        <Typography.Text strong underline>
                          Notice to Stop Work
                        </Typography.Text>
                        <br />
                        <Typography.Text>
                          6.2.2 The manager shall give notice to an inspector of intention to stop
                          [any mining activity] in, at, or about a mine, permanently, indefinitely,
                          or for a definite period exceeding 30 days, and except in an emergency,
                          the notice shall be not less than seven days.
                        </Typography.Text>
                      </>
                    }
                  />
                </>
              }
            >
              {formatDate(info.work_stop_date) || Strings.NOT_APPLICABLE}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions column={1} colon={false}>
            <Descriptions.Item label="Comments" span={1}>
              {info.work_comments || Strings.NOT_APPLICABLE}
            </Descriptions.Item>
          </Descriptions>
          {/* NOTE: Ant Design has no easy way to right-align "Descriptions" so plain HTML tags are used here. */}
          <span style={{ float: "right", display: "inline-flex" }}>
            <div className="inline-flex padding-sm" style={{ marginRight: 10 }}>
              <p className="field-title">Updated By</p>
              <p>{info.updated_by}</p>
            </div>
            <div className="inline-flex padding-sm">
              <p className="field-title">Last Updated</p>
              <p>{formatDateTime(info.updated_timestamp)}</p>
            </div>
          </span>
        </Col>
        <Col span={2}>
          <span style={{ float: "right" }}>
            <AuthorizationWrapper permission={Permission.EDIT_MINES}>
              <Button
                type="primary"
                size="small"
                ghost
                onClick={() => openAddEditMineWorkInformationModal(info)}
              >
                <EditOutlined className="icon-lg icon-svg-filter" />
              </Button>
            </AuthorizationWrapper>
            <AuthorizationWrapper permission={Permission.EDIT_MINES}>
              <Popconfirm
                placement="topLeft"
                title="Are you sure you want to delete this record?"
                onConfirm={() => deleteMineWorkInformation(info.mine_work_information_guid)}
                okText="Delete"
                cancelText="Cancel"
              >
                <Button type="primary" size="small" ghost>
                  <DeleteOutlined className="icon-lg icon-svg-filter" />
                </Button>
              </Popconfirm>
            </AuthorizationWrapper>
          </span>
        </Col>
      </Row>
    </List.Item>
  );

  const dataSource = showAll
    ? props.mineWorkInformations
    : !isEmpty(props.mineWorkInformations)
    ? [props.mineWorkInformations[0]]
    : [];

  const showAllElement = isLoaded &&
    !isEmpty(props.mineWorkInformations) &&
    props.mineWorkInformations.length > 1 && (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
        }}
      >
        <Button onClick={() => setshowAll((prevState) => !prevState)}>
          {showAll ? "Hide" : "Show"} Work History
        </Button>
      </div>
    );

  return (
    <>
      <Row>
        <Col span={24}>
          <h4>
            Work Information
            <AuthorizationWrapper permission={Permission.EDIT_MINES}>
              <AddButton onClick={() => openAddEditMineWorkInformationModal()}>
                Add Work Information
              </AddButton>
            </AuthorizationWrapper>
          </h4>
          <Divider style={{ margin: "0" }} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          {(!isEmpty(props.mineWorkInformations) && (
            <List
              itemLayout="vertical"
              loadMore={showAllElement}
              dataSource={dataSource}
              renderItem={(info) => renderWorkInfo(info)}
              loading={!isLoaded}
            />
          )) || (
            <>
              <br />
              This mine has no recorded work information.
            </>
          )}
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = (state) => ({
  mineWorkInformations: getMineWorkInformations(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineWorkInformations,
      createMineWorkInformation,
      updateMineWorkInformation,
      deleteMineWorkInformation,
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MineWorkInformation);
