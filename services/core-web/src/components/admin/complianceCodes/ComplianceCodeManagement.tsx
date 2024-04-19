import React, { FC, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field, reset } from "redux-form";
import { Button, Table, Row, Col } from "antd";
import { getComplianceCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
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

const ComplianceCodeManagement: FC = () => {
  const dispatch = useDispatch();
  const complianceCodes = useSelector(getComplianceCodes);
  const [editingId, setEditingId] = useState();
  const [isEditMode, setIsEditMode] = useState(false);

  const formatCode = (code) => {
    const cim_or_cpo = code.cim_or_cpo ?? REPORT_REGULATORY_AUTHORITY_CODES.NONE;
    const articleNumber = [code.section, code.sub_section, code.paragraph, code.sub_section]
      .filter(Boolean)
      .join(".");
    return { ...code, articleNumber, cim_or_cpo };
  };

  // item map for the form
  const formattedComplianceCodesMap = complianceCodes?.reduce(
    (acc, code) => ({
      ...acc,
      // form doesn't like fields to be named with numbers, prepend "code"
      [`code${code.compliance_article_id}`]: formatCode(code),
    }),
    {}
  );

  // array for the table rows
  const formattedComplianceCodesList = complianceCodes?.map((code) => formatCode(code));

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

  const handleCancel = () => {
    dispatch(reset(FORM.COMPLIANCE_CODE_BULK_EDIT));
    setIsEditMode(false);
  };

  const columns = [
    renderTextColumn("articleNumber", "Article #", true),
    renderTextColumn("description", "Description", true),
    renderDateColumn("effective_date", "Effective Date", true),
    {
      title: "Expiry date!",
      dataIndex: "expiry_date",
      key: "expiry-date",
      render: (text, record) => {
        return (
          <div>
            {
              <Field
                name={`code${record.compliance_article_id}.expiry_date`}
                label=""
                required
                component={isEditMode ? RenderDate : () => <div>{text}</div>}
                validate={[required]}
              />
            }
          </div>
        );
      },
    },
  ];

  console.log(complianceCodes);

  return (
    <div>
      <Button onClick={() => openAddModal()}>Add</Button>

      <FormWrapper
        name={FORM.COMPLIANCE_CODE_BULK_EDIT}
        onSubmit={(values) => console.log(values)}
        initialValues={formattedComplianceCodesMap}
      >
        <CoreTable
          dataSource={formattedComplianceCodesList}
          columns={columns}
          pagination={{
            total: formattedComplianceCodesList.length,
            defaultPageSize: 10,
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
  );
};

export default ComplianceCodeManagement;
