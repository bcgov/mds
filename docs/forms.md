# Forms Migration Guide

## Overview

This application supports two form implementations.

- Legacy: `FormWrapper` uses redux-form for state management. You'll see this in a lot of forms using things like 
    `Field`, `getFormValues`, and `dispatch(change(...))`. `redux-form` is no longer maintained and we're moving away from it.
- Replacement: `AntdFormWrapper` with `FormField` components. This uses `antd` form for form management.

The AntdFormWrapper is built to keep the same API as the FormWrapper (as far as possible), to keep the migration process simple.

## Migration Steps

1. Replace wrapper components:
   ```tsx
   // Old
   <FormWrapper
     name="my_form"
     onSubmit={handleSubmit}
     reduxFormConfig={{touchOnChange: true}}
   >

   // New
   const [form] = Form.useForm(); // This form instance is what can be used to replace things like getting access to form values, setting form values programmatically, etc.
   <AntdFormWrapper
     form={form} 
     name="my_form"
     onSubmit={handleSubmit}
   >
   ```

2. Replace Field components:

    Note: Not all field components are yet supported with `FormField`. Current list of supported field components:
    
    - RenderDate
    - RenderCheckbox
    - RenderSelect

   ```tsx
   // Old
   <Field
     name="firstName"
     component={RenderField}
     validate={[required]}
   />

   // New  
   <FormField
     name="firstName"
     component={RenderField}
     validate={[required]}
   />
   ```

3. Update form access:
   ```tsx
   // Old
   const formValues = useSelector(getFormValues('myForm'));
   dispatch(change('myForm', 'field', value));

   // New
   const [form] = Form.useForm();
   const values = form.getFieldsValue();
   form.setFieldsValue({field: value});
   ```

4. Replace other redux-form specific features:
   - If you need state handling (e.g. form state to persist across pages), you have to manage it yourself, e.g. via onChange events.
   - The new FormWrapper does not support the redux-form specific options e.g. `enableReinitialize`

## Complete Example

```tsx
// Old Implementation
import { Field } from 'redux-form';
import FormWrapper from './FormWrapper';

const MyForm = () => (
  <FormWrapper
    name="example"
    onSubmit={handleSubmit}
  >
    <Field
      name="field1"
      component={RenderField}
      validate={[required]} 
    />
    <Button htmlType="submit">Submit</Button>
  </FormWrapper>
);

// New Implementation 
import { Form } from 'antd';
import FormField from './FormField';
import AntdFormWrapper from './AntdFormWrapper';

const MyForm = () => {
  const [form] = Form.useForm();
  
  return (
    <AntdFormWrapper
      form={form}
      name="example" 
      onSubmit={handleSubmit}
    >
      <FormField
        name="field1"
        component={RenderField}
        validate={[required]}
      />
      <Button htmlType="submit">Submit</Button>
    </AntdFormWrapper>
  );
};
```

## Key Differences

- Form state management moves from Redux to local Ant Design Form
- Validation happens through Ant Design Form rules
- Field components use 

FormField

 wrapper instead of redux-form's 

Field

- Form methods accessed through 

form

 instance instead of Redux actions

## Common Patterns

### Watching Fields
```tsx
// Old
const value = useSelector(getFormValues('myForm'));

// New  
const value = Form.useWatch('fieldName', form);
```

### Validation

A translation layer has been added to convert redux-form validation functions to Ant Design Form rules.
So the interface is the same!

```tsx
// Old
validate={[required, email]}

// New
validate={[required, email]} // FormField handles conversion
```

### Initial Values
```tsx
// Old
initialValues={{field: value}}

// New  
initialValues={{field: value}} // Same API
```
