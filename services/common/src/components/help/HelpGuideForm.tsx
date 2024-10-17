import React, { FC } from "react";
import { Field } from "redux-form";
import RenderRichTextEditor from "../forms/RenderRichTextEditor";
import { FORM } from "@mds/common/constants";
import FormWrapper from "../forms/FormWrapper";
import { formatSnakeCaseToSentenceCase } from "@mds/common/redux/utils/helpers";
import RenderRadioButtons from "../forms/RenderRadioButtons";
import { HELP_GUIDE_ALL_TABS } from "@mds/common/redux/slices/helpSlice";
import { HelpGuide } from "@mds/common/interfaces/helpGuide.interface";

interface HelpGuideFormProps {
  initialValues?: HelpGuide;
  handleSaveGuide: (values) => void;
  pageTab?: string;
}

const HelpGuideForm: FC<HelpGuideFormProps> = ({ initialValues, handleSaveGuide, pageTab }) => {
  return (
    <FormWrapper
      name={FORM.EDIT_HELP_GUIDE}
      onSubmit={handleSaveGuide}
      initialValues={initialValues}
      reduxFormConfig={{ enableReinitialize: true }}
    >
      {pageTab && (
        <Field
          name="page_tab"
          component={RenderRadioButtons}
          showOptional={false}
          label="This help guide is for:"
          customOptions={[
            { label: `Only this tab - ${formatSnakeCaseToSentenceCase(pageTab)}`, value: pageTab },
            { label: "All tabs", value: HELP_GUIDE_ALL_TABS },
          ]}
        />
      )}
      <Field defaultValue="test default" name="content" component={RenderRichTextEditor} />
    </FormWrapper>
  );
};

export default HelpGuideForm;
