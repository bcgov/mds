import React, { FC, useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Field, getFormValues } from "@mds/common/components/forms/form";
import { Button, Col, Row, Form } from "antd";
import {
    getDropdownMineReportCategoryOptions,
    getDropdownMineReportStatusOptions,
    getDropdownPermitConditionCategoryOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { fetchComplianceReports, getMineReportDefinitionOptions, getReportDefinitionsLoaded, reportParamsGetAll } from "@mds/common/redux/slices/complianceReportsSlice";
import { createDropDownList, sortListObjectsByPropertyLocaleCompare } from "@mds/common/redux/utils/helpers";
import { FORM } from "@mds/common/constants/forms";
import * as Strings from "@mds/common/constants/strings";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { MineReportParams, IMineReport } from "@mds/common/interfaces";
import RenderResetButton from "@mds/common/components/forms/RenderResetButton";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderMultiSelect from "@mds/common/components/forms/RenderMultiSelect";
import RenderField from "@mds/common/components/forms/RenderField";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { getMineReports } from "@mds/common/redux/selectors/reportSelectors";

interface ReportFilterFormProps {
    onSubmit: (params: any) => void;
    onReset: () => void;
    initialValues: MineReportParams;
    mineReportType: string;
}

export const ReportFilterForm: FC<ReportFilterFormProps> = ({
    onReset,
    onSubmit,
    initialValues,
    mineReportType,
}) => {
    const [
        dropdownMineReportDefinitionOptionsFiltered,
        setDropdownMineReportDefinitionOptionsFiltered,
    ] = useState([]);
    const [
        dropdownMineReportCategoryOptionsFiltered,
        setDropdownMineReportCategoryOptionsFiltered,
    ] = useState();

    const dispatch = useAppDispatch();
    const reportDefinitionsLoaded = useSelector(getReportDefinitionsLoaded(reportParamsGetAll));
    const permits = useAppSelector(getPermits);
    const mineReports: IMineReport[] = useAppSelector(getMineReports);
    const dropdownMineReportStatusOptions = useSelector(getDropdownMineReportStatusOptions);
    const dropdownPermitConditionCategoryOptions = useSelector(
        getDropdownPermitConditionCategoryOptions
    );
    const dropdownMineReportCategoryOptions = useSelector(getDropdownMineReportCategoryOptions);
    const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);
    const {
        report_type: selectedMineReportCategory,
        report_name: selectedMineReportDefinitionGuid,
    } = useSelector(getFormValues(FORM.FILTER_REPORTS)) as MineReportParams ?? {};
    const isCore = useAppSelector(getIsCore);
    const shouldShowReportNameFilter = (isCore && mineReportType === Strings.MINE_REPORTS_TYPE.codeRequiredReports) || !isCore;
    const shouldShowPermitFilter = (isCore && mineReportType === Strings.MINE_REPORTS_TYPE.permitRequiredReports) || !isCore;
    const reportTypeOptions = isCore
        ? mineReportType === Strings.MINE_REPORTS_TYPE.codeRequiredReports
            ? dropdownMineReportCategoryOptionsFiltered
            : dropdownPermitConditionCategoryOptions
        : [
            ...(dropdownMineReportCategoryOptionsFiltered ?? []),
            ...(dropdownPermitConditionCategoryOptions ?? []),
        ];

    const getReportRequirementsAssociatedWithAMineReport = (permits, mineReports) => {
        const requirementIds = new Set(
            mineReports.map((report) => {
                if (report.mine_report_permit_requirement_id !== null) {
                    return report.mine_report_permit_requirement_id;
                }
            })
        )

        return permits
            .flatMap((permit) => permit.permit_amendments || [])
            .flatMap((amendment) => amendment.mine_report_permit_requirements || [])
            .filter((req) => requirementIds.has(req.mine_report_permit_requirement_id));
    }

    const reportRequirementsAssociatedWithAMineReport = useMemo(() => {
        return getReportRequirementsAssociatedWithAMineReport(permits, mineReports);
    }, [permits, mineReports]);

    const updateMineReportDefinitionOptions = (
        mineReportDefinitionOptions,
        reportRequirementsAssociatedWithAMineReport,
        selectedMineReportCategory = undefined,
    ) => {
        let mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions;

        if (selectedMineReportCategory) {
            mineReportDefinitionOptionsFiltered = mineReportDefinitionOptions.filter(
                (rd) =>
                    rd.categories.filter((c) => c.mine_report_category === selectedMineReportCategory)
                        .length > 0
            );
        }

        if (reportRequirementsAssociatedWithAMineReport.length > 0) {
            mineReportDefinitionOptionsFiltered = [...mineReportDefinitionOptionsFiltered, ...reportRequirementsAssociatedWithAMineReport];
        }

        const normalizedItems = mineReportDefinitionOptionsFiltered.map(item => ({
            ...item,
            menu_value:
                item.mine_report_permit_requirement_id ??
                item.mine_report_definition_guid
        }));

        let newDropdownMineReportDefinitionOptionsFiltered = createDropDownList(
            normalizedItems,
            "report_name",
            "menu_value"
        );

        newDropdownMineReportDefinitionOptionsFiltered = sortListObjectsByPropertyLocaleCompare(
            newDropdownMineReportDefinitionOptionsFiltered,
            "label"
        );

        setDropdownMineReportDefinitionOptionsFiltered(newDropdownMineReportDefinitionOptionsFiltered);
    };

    const updateMineReportCategoryOptions = (
        dropdownMineReportCategoryOptions,
        selectedMineReportDefinitionGuid = undefined
    ) => {
        let newDropdownMineReportCategoryOptionsFiltered = dropdownMineReportCategoryOptions;

        if (selectedMineReportDefinitionGuid) {
            const selectedMineReportDefinition = mineReportDefinitionOptions.filter(
                (option) => option.mine_report_definition_guid === selectedMineReportDefinitionGuid
            )[0];
            if (selectedMineReportDefinition) {
                newDropdownMineReportCategoryOptionsFiltered = dropdownMineReportCategoryOptions.filter(
                    (cat) =>
                        selectedMineReportDefinition.categories
                            .map((category) => category.mine_report_category)
                            .includes(cat.value)
                );
            }
        }

        setDropdownMineReportCategoryOptionsFiltered(newDropdownMineReportCategoryOptionsFiltered);
    };

    useEffect(() => {
        if (!reportDefinitionsLoaded) {
            dispatch(fetchComplianceReports(reportParamsGetAll));
        }
    }, []);

    useEffect(() => {
        updateMineReportDefinitionOptions(mineReportDefinitionOptions, reportRequirementsAssociatedWithAMineReport, selectedMineReportCategory);
    }, [mineReportDefinitionOptions, selectedMineReportCategory, reportRequirementsAssociatedWithAMineReport]);

    useEffect(() => {
        updateMineReportCategoryOptions(
            dropdownMineReportCategoryOptions,
            selectedMineReportDefinitionGuid
        );
    }, [dropdownMineReportCategoryOptions, selectedMineReportDefinitionGuid]);

    let permitDropdown = [];
    if (permits) {
        permitDropdown = createDropDownList(permits, "permit_no", "permit_guid");
    }

    return (
        <FormWrapper
            name={FORM.FILTER_REPORTS}
            reduxFormConfig={{ touchOnBlur: false, enableReinitialize: true }}
            onSubmit={onSubmit}
            initialValues={initialValues}
            onReset={onReset}
        >
            <div className="hide-required-indicator">
                <Row gutter={16}>
                    <Col md={8} sm={24}>
                        <Field
                            id="report_type"
                            name="report_type"
                            label="Condition Category"
                            placeholder="Select condition category"
                            allowClear
                            component={RenderSelect}
                            data={reportTypeOptions}
                        />
                    </Col>
                    {shouldShowReportNameFilter && (
                        <Col md={8} sm={24}>
                            <Field
                                id="report_name"
                                name="report_name"
                                label="Report Name"
                                placeholder="Select report name"
                                component={RenderSelect}
                                data={dropdownMineReportDefinitionOptionsFiltered}
                                allowClear
                            />
                        </Col>
                    )}
                    {shouldShowPermitFilter && (
                        <Col md={8} sm={24}>
                            <Field
                                id="permit_guid"
                                name="permit_guid"
                                label="Permit"
                                placeholder="Select a Permit"
                                component={RenderSelect}
                                data={permitDropdown}
                            />
                        </Col>
                    )}
                    <Col md={8} sm={24}>
                        <Field
                            id="compliance_year"
                            name="compliance_year"
                            label="Compliance Year"
                            placeholder="Select compliance year"
                            component={RenderDate}
                            allowClear
                            yearMode
                        />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col md={8} sm={24}>
                        <Form.Item label="Due Date Range">
                            <Row gutter={16}>
                                <Col md={12} sm={24}>
                                    <Field
                                        id="due_date_start"
                                        name="due_date_start"
                                        placeholder="Select earliest date"
                                        component={RenderDate}
                                        allowClear
                                    />
                                </Col>
                                <Col md={12} sm={24}>
                                    <Field
                                        id="due_date_end"
                                        name="due_date_end"
                                        placeholder="Select latest date"
                                        component={RenderDate}
                                        allowClear
                                    />
                                </Col>
                            </Row>
                        </Form.Item>
                    </Col>
                    <Col md={8} sm={24}>
                        <Form.Item label="Received Date Range">
                            <Row gutter={16}>
                                <Col md={12} sm={24}>
                                    <Field
                                        id="received_date_start"
                                        name="received_date_start"
                                        placeholder="Select earliest date"
                                        component={RenderDate}
                                        allowClear
                                    />
                                </Col>
                                <Col md={12} sm={24}>
                                    <Field
                                        id="received_date_end"
                                        name="received_date_end"
                                        placeholder="Select latest date"
                                        component={RenderDate}
                                        allowClear
                                    />
                                </Col>
                            </Row>
                        </Form.Item>
                    </Col>
                    {isCore && <Col md={8} sm={24}>
                        <Field
                            id="requested_by"
                            name="requested_by"
                            label="Requested By"
                            placeholder="Enter keyword"
                            component={RenderField}
                            allowClear
                        />
                    </Col>}
                </Row>
                <Row gutter={16}>
                    <Col md={8} sm={24}>
                        <Field
                            id="status"
                            name="status"
                            label="Status"
                            placeholder="Select status"
                            component={RenderMultiSelect}
                            data={dropdownMineReportStatusOptions}
                        />
                    </Col>
                    <Col md={8} sm={24}>
                        <Field
                            id="received_only"
                            name="received_only"
                            label="Received Status"
                            placeholder="Select received status"
                            component={RenderSelect}
                            data={[
                                { value: "true", label: "Received Only" },
                                {
                                    value: "false",
                                    label: "Received and Unreceived",
                                },
                            ]}
                        />
                    </Col>
                </Row>
            </div>
            <div className="right center-mobile">
                <RenderResetButton className="full-mobile" buttonText="Clear Filters" />
                <Button className="full-mobile" type="primary" htmlType="submit">
                    Apply Filters
                </Button>
            </div>
        </FormWrapper>
    );
};

export default ReportFilterForm;
