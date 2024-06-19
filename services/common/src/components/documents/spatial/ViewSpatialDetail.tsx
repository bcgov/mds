import React, { FC } from "react";
import { useSelector } from "react-redux";
import CoreTable from "../../common/CoreTable";
import { renderTextColumn } from "../../common/CoreTableCommonColumns";
import { formatDate } from "@mds/common/redux/utils/helpers";
import { getUserInfo } from "@mds/common/redux/selectors/authenticationSelectors";

export interface ViewSpatialDetailProps {
  spatialBundle: any[];
}
const ViewSpatialDetail: FC<ViewSpatialDetailProps> = ({ spatialBundle }) => {
  const { preferred_username } = useSelector(getUserInfo);
  return (
    <>
      <div> map goes here</div>
      <CoreTable
        size="small"
        rowKey="document_manager_guid"
        showHeader={false}
        dataSource={spatialBundle}
        columns={[
          renderTextColumn("document_name", ""),
          {
            dataIndex: "document_name",
            key: "fileType",
            render: (text) => {
              return text.split(".")[1].toUpperCase();
            },
          },
          {
            key: "uploadDate",
            render: () => {
              return formatDate(new Date());
            },
          },
          {
            key: "uploadUser",
            render: () => {
              return preferred_username;
            },
          },
        ]}
      />
    </>
  );
};

export default ViewSpatialDetail;
