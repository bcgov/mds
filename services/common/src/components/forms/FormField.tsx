import React, { ChangeEvent, Component, ComponentType, Dispatch, EventHandler, FocusEvent, DragEvent } from 'react';
import { BaseInputProps } from './BaseInput';
import { Form } from 'antd';
import { SelectProps } from './RenderSelect';

interface WrappedFieldMetaProps {
    active?: boolean;
    autofilled: boolean;
    asyncValidating: boolean;
    dirty: boolean;
    error?: any;
    form: string;
    initial: any;
    invalid: boolean;
    pristine: boolean;
    submitting: boolean;
    submitFailed: boolean;
    touched: boolean;
    valid: boolean;
    visited: boolean;
    warning?: any;
}

type FormFieldComponentType = Partial<BaseInputProps & SelectProps>;

interface FormFieldProps<T extends FormFieldComponentType> extends FormFieldComponentType {
    name: string;
    validate: ((value: any) => string)[];
    onChange?: (value: any) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    props?: any;
    component: ComponentType<T>;
}

interface WrappedFieldInputProps extends CommonFieldInputProps {
    checked?: boolean;
    value: any;
    onBlur: EventHandler<FocusEvent<any>>;
    onChange: EventHandler<ChangeEvent<any>>;
}

interface CommonFieldInputProps {
    name: string;
    onDragStart: EventHandler<DragEvent<any>>;
    onDrop: EventHandler<DragEvent<any>>;
    onFocus: EventHandler<FocusEvent<any>>;
}

const FormField = <T extends FormFieldComponentType>(props: FormFieldProps<T>) => {
    const { component: Comp, ...restProps } = props;

    const formInstance = Form.useFormInstance();

    const val = Form.useWatch(props.name, formInstance);
    const fieldErrors = formInstance?.getFieldError(props.name) || [];

    const notImplemented = (prop: string) => {
        return new Error(`The property ${prop} previously provided by redux-form is not implemented by the replacement FormField`);
    }

    const input: WrappedFieldInputProps = {
        name: props.name,
        onBlur: () => {
            if (props.onBlur) {
                return props.onBlur();
            }
        },
        onChange: (value) => {
            if (props.onChange) {
                props.onChange(value);
            }
        },
        onDragStart: () => {
            throw notImplemented('onDragStart');
        },
        onDrop: () => {
            throw notImplemented('onDrop');
        },
        onFocus: () => {
            if (props.onFocus) {
                return props.onFocus();
            }
        },
        value: val
    };

    const meta: WrappedFieldMetaProps = {
        error: fieldErrors.length ? fieldErrors[0] : undefined,
        initial: formInstance?.getFieldValue(props.name),
        invalid: !!fieldErrors.length,
        form: props.name,
        get pristine(): boolean { throw notImplemented('pristine') },
        get submitting(): boolean { throw notImplemented('submitting') },
        get submitFailed(): boolean { throw notImplemented('submitFailed') },
        get touched(): boolean { throw notImplemented('touched') },
        get valid(): boolean { throw notImplemented('valid') },
        get visited(): boolean { throw notImplemented('visited') },
        get active(): boolean { throw notImplemented('active') },
        get autofilled(): boolean { throw notImplemented('autofilled') },
        get asyncValidating(): boolean { throw notImplemented('asyncValidating') },
        get dirty(): boolean { throw notImplemented('dirty') },
    };

    return <Comp {...restProps} meta={meta} input={input} rules={[createAntdValidator(props.validate)]} {...props.props} isReduxForm={true} />;
}

export function createAntdValidator(validations: Array<(value: any) => string>) {
    return {
        validator: async (_rule: any, value: any) => {
            const errors = validations
                .map(validate => validate(value))
                .filter(Boolean);

            if (errors.length) {
                return Promise.reject(new Error(errors[0]));
            }
            return Promise.resolve();
        }
    }
}

export default FormField;