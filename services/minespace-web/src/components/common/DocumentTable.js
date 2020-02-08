import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument),
  // eslint-disable-next-line react/no-unused-prop-types
  removeDocument: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  documents: [],
  removeDocument: () => {},
};

export const DocumentTable = (props) => {
  const columns = [
    {
      title: "File name",
      dataIndex: "document_name",
      render: (text, record) => {
        return (
          <div title="File name">
            <LinkButton
              title={text}
              key={record.mine_document_guid}
              onClick={() => downloadFileFromDocumentManager(record)}
            >
              {truncateFilename(text)}
            </LinkButton>
          </div>
        );
      },
    },
    {
      title: "Category",
      dataIndex: "variance_document_category_code",
      render: (text) => <div title="Upload date">{props.documentCategoryOptionsHash[text]}</div>,
    },
    {
      title: "Upload date",
      dataIndex: "upload_date",
      render: (text) => <div title="Upload date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
    },
    // {
    //   title: "",
    //   dataIndex: "updateEdit",
    //   width: 10,
    //   className: props.isViewOnly ? "column-hide" : "",
    //   render: (text, record) => (
    //     <div title="" align="right" className={props.isViewOnly ? "column-hide" : ""}>
    //       <Popconfirm
    //         placement="topLeft"
    //         title={`Are you sure you want to delete ${record.name}?`}
    //         onConfirm={(event) => props.removeDocument(event, record.key)}
    //         okText="Delete"
    //         cancelText="Cancel"
    //       >
    //         <Button ghost type="primary" size="small">
    //           <Icon type="minus-circle" theme="outlined" />
    //         </Button>
    //       </Popconfirm>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        locale={{ emptyText: "This variance does not contain any documents." }}
        dataSource={props.documents}
      />
    </div>
  );
};

DocumentTable.propTypes = propTypes;
DocumentTable.defaultProps = defaultProps;

export default DocumentTable;
