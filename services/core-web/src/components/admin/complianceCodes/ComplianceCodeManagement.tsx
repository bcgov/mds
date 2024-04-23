import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { change, Field, reset } from "redux-form";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { Button, Input, Row, Table, Typography } from "antd";

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
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { IComplianceArticle, ItemMap } from "@mds/common/interfaces/";
import { sortComplianceCodesByArticleNumber } from "@mds/common/redux/utils/helpers";
import PermitConditionsNavigation from "../permitConditions/PermitConditionsNavigation";
import {
  fetchComplianceCodes,
  getFormattedComplianceCodes,
  updateComplianceCodes,
} from "@mds/common/redux/slices/complianceCodesSlice";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";

const ComplianceCodeManagement: FC = () => {
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const formPrefix = "code";
  const [editedIds, setEditedIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const complianceCodes: ItemMap<IComplianceArticle> = useSelector(getFormattedComplianceCodes);
  const [filteredRecordsList, setFilteredRecordsList] = useState<IComplianceArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!complianceCodes) {
      setIsLoading(true);
      dispatch(fetchComplianceCodes({})).then(() => {
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (complianceCodes) {
      const newList = Object.values(complianceCodes).sort(sortComplianceCodesByArticleNumber);
      setFilteredRecordsList(newList);
    }
  }, [complianceCodes]);

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
    const initialCodeValue = complianceCodes[field[0]];
    const id = initialCodeValue?.compliance_article_id;
    const initialValue = initialCodeValue[field[1]];
    const changedFromInitial = newVal !== initialValue;

    if (!editedIds.includes(id) && changedFromInitial) {
      setEditedIds([...editedIds, id]);
    } else if (editedIds.includes(id) && !changedFromInitial) {
      setEditedIds(editedIds.filter((compliance_id) => id !== compliance_id));
    }
  };

  const handleModalSave = (values: IComplianceArticle) => {
    dispatch(
      change(FORM.COMPLIANCE_CODE_BULK_EDIT, `${formPrefix}${values.compliance_article_id}`, values)
    );
  };

  const openAddModal = () => {
    dispatch(
      openModal({
        props: {
          title: "Add Health and Safety Reclamation Code",
          onSave: handleModalSave,
        },
        content: ComplianceCodeViewEditForm,
      })
    );
  };

  const openViewModal = (record: IComplianceArticle) => {
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

  const handleSubmit = (values: IComplianceArticle[]) => {
    const editedValues = editedIds.map((id) => {
      return values[`${formPrefix}${id}`];
    });
    // array of compliance articles that have been changed
    dispatch(updateComplianceCodes(editedValues)).then((resp) => {
      if (resp.payload) {
        setIsEditMode(false);
        setEditedIds([]);
      }
    });
  };

  const handleSearch = (confirm, field, searchInputText) => {
    if (searchInputText && searchInputText.length) {
      const filteredRecords = Object.values(complianceCodes)
        .filter((code) => {
          return code[field]
            .toString()
            .toLowerCase()
            .startsWith((searchInputText as string).toLowerCase());
        })
        .sort(sortComplianceCodesByArticleNumber);
      setFilteredRecordsList(filteredRecords);
    } else {
      setFilteredRecordsList(
        Object.values(complianceCodes).sort(sortComplianceCodesByArticleNumber)
      );
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

  const actionMenu = renderActionsColumn({
    actions: viewModeActions,
  });

  const editModeResetColumn = {
    key: "reset-action",
    render: (record) => {
      const isEditingRecord = editedIds.includes(record.compliance_article_id);
      return (
        <div>
          <Button disabled={!isEditingRecord} onClick={() => resetRow(record)}>
            Reset
          </Button>
        </div>
      );
    },
  };

  const columns = [
    {
      key: "articleNumber",
      dataIndex: "articleNumber",
      title: "Section",
      width: 150,
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
    renderTextColumn("description", "Description"),
    { ...renderDateColumn("effective_date", "Date Active"), width: 150 },
    {
      title: "Date Expire",
      dataIndex: "expiry_date",
      key: "expiry-date",
      width: 170,
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
    !isEditMode && actionMenu,
    isEditMode && editModeResetColumn,
  ].filter(Boolean);

  const setExpiredRowBackground = (record: IComplianceArticle) => {
    if (record.is_expired) {
      return "expired-row";
    }
    return "";
  };

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
          initialValues={complianceCodes}
        >
          <CoreTable
            loading={isLoading}
            dataSource={filteredRecordsList}
            columns={columns}
            rowClassName={setExpiredRowBackground}
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
                          <Button
                            type="primary"
                            htmlType="submit"
                            disabled={editedIds.length === 0}
                          >
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

export default AuthorizationGuard(Permission.EDIT_COMPLIANCE_CODES)(ComplianceCodeManagement);
