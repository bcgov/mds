import React, { FC, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field, reset, change } from "redux-form";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { Button, Table, Row, Input, Typography } from "antd";

import { getComplianceCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  renderActionsColumn,
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { required } from "@mds/common/redux/utils/Validate";
import { openModal } from "@mds/common/redux/actions/modalActions";
import * as FORM from "@/constants/forms";
import ComplianceCodeViewEditForm from "./ComplianceCodeViewEditForm";
import RenderDate from "@mds/common/components/forms/RenderDate";
import { REPORT_REGULATORY_AUTHORITY_CODES } from "@mds/common/constants/enums";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { IComplianceArticle } from "@mds/common/interfaces/";
import {
  dateSorter,
  formatComplianceCodeArticleNumber,
  sortComplianceCodesByArticleNumber,
} from "@mds/common/redux/utils/helpers";
import PermitConditionsNavigation from "../permitConditions/PermitConditionsNavigation";

const ComplianceCodeManagement: FC = () => {
  const dispatch = useDispatch();
  const complianceCodes: IComplianceArticle[] = useSelector(getComplianceCodes);
  const [isEditMode, setIsEditMode] = useState(false);
  const formPrefix = "code";
  const [editedIds, setEditedIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredRecordsList, setFilteredRecordsList] = useState([]);

  const formatCode = (code) => {
    const cim_or_cpo = code.cim_or_cpo ?? REPORT_REGULATORY_AUTHORITY_CODES.NONE;
    const articleNumber = formatComplianceCodeArticleNumber(code);
    return { ...code, articleNumber, cim_or_cpo };
  };

  // array for the table rows
  const formattedComplianceCodesList = complianceCodes
    ?.map((code) => formatCode(code))
    .sort(sortComplianceCodesByArticleNumber);

  useEffect(() => {
    setFilteredRecordsList(formattedComplianceCodesList);
  }, []);

  // item map for the form
  const formattedComplianceCodesMap = formattedComplianceCodesList?.reduce(
    (acc, code) => ({
      ...acc,
      // form doesn't like fields to be named with numbers, prepend "code"
      [`${formPrefix}${code.compliance_article_id}`]: code,
    }),
    {}
  );

  const resetRow = (record) => {
    const fieldName = `${formPrefix}${record.compliance_article_id}`;
    if (editedIds.includes(record.compliance_article_id)) {
      // the record retains the original values
      dispatch(change(FORM.COMPLIANCE_CODE_BULK_EDIT, fieldName, record));
      setEditedIds(editedIds.filter((id) => id !== record.compliance_article_id));
    }
  };

  const handleChange = (_val, newVal, _prevVal, fieldName) => {
    const field = fieldName.split(".");
    const initialCodeValue = formattedComplianceCodesMap[field[0]] ?? {};
    const id = initialCodeValue.compliance_article_id;
    const initialValue = initialCodeValue[field[1]];
    const changedFromInitial = newVal !== initialValue;

    if (!editedIds.includes(id) && changedFromInitial) {
      setEditedIds([...editedIds, id]);
    } else if (editedIds.includes(id) && !changedFromInitial) {
      setEditedIds(editedIds.filter((compliance_id) => id !== compliance_id));
    }
  };

  const openAddModal = () => {
    dispatch(
      openModal({
        props: {
          title: "Add Health and Safety Reclamation Code",
        },
        content: ComplianceCodeViewEditForm,
      })
    );
  };

  const openViewModal = (record) => {
    dispatch(
      openModal({
        props: {
          title: "View Health and Safety Reclamation Code",
          isEditMode: false,
          initialValues: record,
        },
        content: ComplianceCodeViewEditForm,
      })
    );
  };

  const handleCancel = () => {
    dispatch(reset(FORM.COMPLIANCE_CODE_BULK_EDIT));
    setIsEditMode(false);
    setEditedIds([]);
  };

  const handleSubmit = (values) => {
    const editedValues = editedIds.map((id) => {
      return values[`${formPrefix}${id}`];
    });
    // array of compliance articles that have been changed
    console.log(editedValues);
  };

  const handleSearch = (confirm, field, searchInputText) => {
    if (searchInputText && searchInputText.length) {
      const filteredRecords = formattedComplianceCodesList.filter((code) => {
        return code[field]
          .toString()
          .toLowerCase()
          .startsWith((searchInputText as string).toLowerCase());
      });
      setFilteredRecordsList(filteredRecords);
    } else {
      setFilteredRecordsList(formattedComplianceCodesList);
    }

    confirm();
  };

  const viewModeActions = [
    {
      key: "view",
      label: "View",
      clickFunction: (event, record) => openViewModal(record),
    },
  ];

  const editModeActions = [
    {
      key: "reset",
      label: "Reset",
      clickFunction: (event, record) => resetRow(record),
    },
  ];

  const columns = [
    renderTextColumn("compliance_article_id", "ID", true),
    {
      ...renderTextColumn("articleNumber", "Section", true, null, 150),
      filterIcon: () => <SearchOutlined />,
      filterDropdown: ({ confirm }) => {
        return (
          <div style={{ padding: 8 }}>
            <Row style={{ minWidth: 240 }}>
              <Input
                placeholder="Search Compliance Article"
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={() => handleSearch(confirm, "articleNumber", searchText)}
                allowClear
              />
            </Row>
            <Button
              onClick={() => handleSearch(confirm, "articleNumber", searchText)}
              icon={<SearchOutlined />}
              size="small"
              type="primary"
            >
              Search
            </Button>
            <Button
              onClick={() => {
                setSearchText("");
                handleSearch(confirm, "articleNumber", "");
              }}
              size="small"
            >
              Reset
            </Button>
          </div>
        );
      },
    },
    renderTextColumn("description", "Description", true),
    { ...renderDateColumn("effective_date", "Date Active", true), width: 150 },
    {
      title: "Date Expire",
      dataIndex: "expiry_date",
      key: "expiry-date",
      width: 170,
      sorter: dateSorter("expiry_date"),
      render: (text, record) => {
        return (
          <div
            className={
              editedIds.includes(record.compliance_article_id) ? "modified-table-cell" : ""
            }
          >
            {
              <Field
                name={`${formPrefix}${record.compliance_article_id}.expiry_date`}
                label=""
                required
                onChange={handleChange}
                component={isEditMode ? RenderDate : () => <div>{text}</div>}
                validate={[required]}
              />
            }
          </div>
        );
      },
    },
    renderActionsColumn({
      actions: isEditMode ? editModeActions : viewModeActions,
    }),
  ];

  return (
    <div>
      <div className="landing-page__header">
        <h1>Permit Condition Management</h1>
      </div>
      <PermitConditionsNavigation
        activeButton="hsrc-management"
        openSubMenuKey={["submenu-compliance-codes"]}
      />
      <div className="tab__content">
        <h2>Health and Safety Reclamation Code</h2>
        <Typography.Text>
          Manage HSRC in the system that are associated with <b>Incidents, Variances,</b> and{" "}
          <b>Reports</b>. View the code to see long description and the regulatory authority.
        </Typography.Text>
        <Row justify="end">
          <Button
            onClick={() => openAddModal()}
            disabled={isEditMode}
            type="primary"
            icon={<PlusOutlined />}
          >
            Add Code
          </Button>
        </Row>
        <FormWrapper
          name={FORM.COMPLIANCE_CODE_BULK_EDIT}
          onSubmit={handleSubmit}
          initialValues={formattedComplianceCodesMap}
        >
          <CoreTable
            dataSource={filteredRecordsList}
            columns={columns}
            rowKey="compliance_article_id"
            pagination={{
              total: filteredRecordsList.length,
              defaultPageSize: 50,
              position: ["bottomCenter"],
              disabled: isEditMode,
            }}
            summary={() => (
              <Table.Summary fixed={"bottom"}>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={columns.length}>
                    <Row justify="end">
                      {isEditMode ? (
                        <>
                          <RenderCancelButton cancelFunction={handleCancel} />
                          <Button type="primary" htmlType="submit">
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditMode(true)} type="primary">
                          Edit Expiry Dates
                        </Button>
                      )}
                    </Row>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
            sticky
          />
        </FormWrapper>
      </div>
    </div>
  );
};

export default ComplianceCodeManagement;
