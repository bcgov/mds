import React, { FC, ReactNode } from "react";
import { Form, Typography, TreeSelect } from "antd";
import { TreeSelectProps } from "antd";
import { BaseInputProps, getFormItemLabel } from "./BaseInput";
import { FormConsumer, IFormContext } from "./FormWrapper";
import { EMPTY_FIELD } from "@mds/common/constants/strings";

/**
 * @constant RenderTreeSelect - Ant Design `TreeSelect` component for redux-form - used for hierarchical data sets;
 * https://4x.ant.design/components/tree-select/
 */

interface RenderTreeSelectProps extends BaseInputProps {
    loading?: boolean;
    viewDisplay?: (opts: any) => ReactNode;
}

const defaultViewDisplay = (opts: any[]): ReactNode => {

    if (!opts.length) {
        return <div className="multi-select-view">
            <Typography.Paragraph className="view-item-value">
                {EMPTY_FIELD}
            </Typography.Paragraph>
        </div>
    }
    return <ul className="multi-select-view margin-large--left">
        {opts.map((opt) =>
            <li key={opt.value ?? opt.id}>
                <Typography.Paragraph className="view-item-value">{opt.title}</Typography.Paragraph>
            </li>
        )}
    </ul>
};

const getLabelsRecursive = (value: any[], opts: any[]) => {
    if (!opts?.length) { return []; }

    const childLabels = opts.reduce((acc, o) => {
        const oLabels = getLabelsRecursive(value, o.children);
        return [...acc, ...oLabels]
    }, []);

    const includedNodes = opts.filter((o) => value.includes(o.value)).map((o) => ({ title: o.title, value: o.value }));
    return [...includedNodes, ...childLabels]
}

export const parseTreeValues = (values: any[] | { value: any }[] | { id: any }[]) => {
    if (values.length > 0) {
        if (typeof values[0] === "object" && "value" in values[0]) {
            return values.map((v: any) => v.value);
        }
        if (typeof values[0] === "object" && "id" in values[0]) {
            return values.map((v: any) => v.id);
        }
    }
    return values;
};

export const RenderTreeSelect: FC<RenderTreeSelectProps & TreeSelectProps> = ({
    placeholder = "",
    // treeData & treeDataSimpleMode- SEE antd documentation, but essentially 
    // treeDataSimpleMode can be used to pass in an array of options with id references to parent nodes,
    // or treeData can be used to pass in nested data. node data has more available properties such as checkable
    treeData = [],
    treeDataSimpleMode = false,
    treeCheckStrictly = true, // don't associate parent/child
    treeCheckable = true,
    treeLine = true,
    disabled = false,
    label = "",
    multiple = false,
    treeDefaultExpandAll = true,
    viewDisplay = defaultViewDisplay,
    showNA,
    meta,
    input,
    ...props
}) => {
    return (
        <FormConsumer>
            {(value: IFormContext) => {
                const { isEditMode, isModal } = value;
                if (!isEditMode) {
                    let selectedOptions = [];
                    if (treeDataSimpleMode) {
                        selectedOptions = treeData.filter((opt) => input.value.includes(opt.id));
                    } else {
                        selectedOptions = getLabelsRecursive(input.value, treeData);
                    }

                    return <div className="view-item ant-form-item">
                        {label && label !== "" && (
                            <Typography.Paragraph className="view-item-label">{label}</Typography.Paragraph>
                        )}
                        {(input.value.length > 0 || showNA) && (viewDisplay(selectedOptions))}
                    </div>
                }

                const extraProps = isModal ? null : { getPopupContainer: (trigger) => trigger.parentNode };
                return (
                    <div className="form-treeselect">
                        <Form.Item
                            name={input.name}
                            required={props.required}
                            label={getFormItemLabel(label, props.required)}
                            validateStatus={
                                meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""
                            }
                            help={
                                meta.touched &&
                                ((meta.error && <span>{meta.error}</span>) ||
                                    (meta.warning && <span>{meta.warning}</span>))
                            }
                        >
                            <>
                                <TreeSelect
                                    loading={props.loading}
                                    style={{ width: "100%" }}
                                    virtual={false}
                                    disabled={!treeData || disabled}
                                    multiple={multiple}
                                    size="small"
                                    placeholder={placeholder}
                                    id={props.id ?? input.name}
                                    treeData={treeData}
                                    onChange={(newValue) => {
                                        input.onChange(parseTreeValues(newValue))
                                    }}
                                    treeDefaultExpandAll={treeDefaultExpandAll}
                                    showArrow
                                    value={input.value}
                                    treeCheckStrictly={treeCheckStrictly}
                                    treeLine={treeLine}
                                    treeCheckable={treeCheckable}
                                    {...props}
                                    {...extraProps}
                                />
                                {props.help && <div className={`form-item-help ${input.name}-form-help`}>{props.help}</div>}
                            </>
                        </Form.Item>
                    </div>
                );
            }}
        </FormConsumer>
    );
};

export default RenderTreeSelect;
