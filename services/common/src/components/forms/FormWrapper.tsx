import React, { FC } from "react";
import { Form } from "antd";
import { compose } from "@reduxjs/toolkit";
import { connect, useDispatch } from "react-redux";
import { reduxForm, submit, InjectedFormProps, ConfigProps } from "redux-form";

export interface IFormContext {
  isEditMode: boolean;
  isModal: boolean;
}

export const { Provider: FormProvider, Consumer: FormConsumer } = React.createContext<IFormContext>(
  {
    isEditMode: true,
    isModal: false,
  }
);

/**
 * USAGE NOTES:
 * - pass in params like "touchOnBlur" and "onSubmitSuccess" for reduxForm through reduxFormConfig for custom behaviour
 */
interface FormWrapperProps {
  name: string;
  reduxFormConfig?: Partial<ConfigProps>;
  onSubmit: (values) => void | Promise<void>;
  children: any;
  isModal?: boolean;
  loading?: boolean;
  isEditMode?: boolean;
}

const FormWrapper: FC<FormWrapperProps & InjectedFormProps<any>> = ({
  isEditMode = true,
  isModal = false,
  children,
  ...props
}) => {
  const providerValues = {
    isEditMode,
    isModal,
  };
  const dispatch = useDispatch();

  const handleSubmit = (values) => {
    dispatch(submit(props.name));
    props.onSubmit(values);
  };

  return (
    <FormProvider value={providerValues}>
      <Form layout="vertical" onFinish={handleSubmit} name={props.name}>
        {children}
      </Form>
    </FormProvider>
  );
};

const mapStateToProps = (_state, ownProps) => ({
  form: ownProps.name,
  ...ownProps.reduxFormConfig,
});
export default compose(connect(mapStateToProps), reduxForm({}))(FormWrapper as any) as FC<
  FormWrapperProps
>;
