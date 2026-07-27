import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import FormWrapper from "./FormWrapper";
import { Field, FieldArray, FormSection } from "./form";
import RenderAutoComplete from "./RenderAutoComplete";
import RenderAutoSizeField from "./RenderAutoSizeField";
import RenderCancelButton from "./RenderCancelButton";
import RenderSubmitButton from "./RenderSubmitButton";
import RenderCheckbox from "./RenderCheckbox";
import RenderDate from "./RenderDate";
import RenderDateTimeTz from "./RenderDateTimeTz";
import RenderField from "./RenderField";
import RenderFileUpload from "./RenderFileUpload";
import RenderGroupCheckbox from "./RenderGroupCheckbox";
import RenderGroupedSelect from "./RenderGroupedSelect";
import RenderHiddenField from "./RenderHiddenField";
import RenderLargeSelect from "./RenderLargeSelect";
import RenderMultiSelect from "./RenderMultiSelect";
import RenderBCRegistrationSearch from "./RenderBCRegistrationSearch";
import RenderRadioButtons from "./RenderRadioButtons";
import RenderResetButton from "./RenderResetButton";
import RenderRichTextEditor from "./RenderRichTextEditor";
import RenderSelect from "./RenderSelect";
import RenderTime from "./RenderTime";
import RenderTreeSelect from "./RenderTreeSelect";
import { normalizeDatetime } from "@mds/common/redux/utils/helpers";

const initialValues = {
    autocomplete: "opt1",
    autosize: "auto input",
    checkbox: true,
    date: "2020-04-01",
    datetimetz: new Date("2020-04-01"),
    // why SK tz? Because the snapshot won't change twice a year. :)
    tz_field_name: "Canada/Saskatchewan",
    groupcheckbox: ["a", "c"],
    groupedselect: ["b", "d"],
    hiddenfield: "hidden value",
    orgbooksearch: "Orgbook Option Label",
    largeselect: "opt2",
    multiselect: "opt3",
    radiobuttons: "opt1",
    richtexteditor: "Rich Text!",
    select: "opt2",
    field_array: ["one", "two", "three"],
    section: {
        sectionfield: "There should be a value here",
        subsection: {
            subsectionfield: "There should be a value here too"
        }
    },
    nest: {
        nest_array: [
            {
                sub_nest: {
                    sub_array: ["one!", "two!"]

                },

            }, {
                sub_nest: {
                    sub_array: ["three!"]
                }
            }
        ]
    }
};

const simpleOptions = [
    { label: "Opt 1", value: "opt1" },
    { label: "Opt 2", value: "opt2" },
    { label: "Opt 3", value: "opt3" }
]

const TestFieldArray = ({ fields, testProp }) => {
    return (
        <>
            {fields.map((fieldName: string, index) => (
                <Field
                    label={`Field Array ${testProp} ${index}`}
                    name={fieldName}
                    component={RenderField}
                />
            ))}
        </>
    );
};

const TestNested = ({ fields, testProp }) => {
    return (
        <>
            {fields.map((fieldName: string, index) => (
                <FormSection name={`${fieldName}.sub_nest`} key={fieldName}>
                    <div>{`Section: ${index}`}</div>
                    <FieldArray
                        name="sub_array"
                        component={TestFieldArray}
                        props={{ testProp }}
                    />
                </FormSection>
            ))}
        </>
    );
};

describe("ViewForm", () => {
    it("renders properly all the components in view mode", () => {
        const { container } = render(
            // redux wrapper for rich text editor to get colour options
            // *not* for providing form values
            <ReduxWrapper>
                <FormWrapper
                    name="view-test"
                    initialValues={initialValues}
                    isEditMode={false}
                >
                    <Field
                        name="autocomplete"
                        label="Auto Complete"
                        component={RenderAutoComplete}
                        data={simpleOptions}
                    />
                    <Field
                        name="autosize"
                        label="Auto Size Field"
                        component={RenderAutoSizeField}
                        maximumCharacters={10}
                    />
                    {/* Cascader is never used in a view context */}
                    {/* <Field
                    id="cascader"
                    name="cascader"
                    label="Cascader"
                    component={RenderCascader}
                    options={[]}
                    placeholder="placeholder text"
                /> */}
                    <Field
                        name="checkbox"
                        label="Checkbox"
                        component={RenderCheckbox}
                    />
                    <Field
                        name="date"
                        label="Date"
                        component={RenderDate}
                    />
                    <Field
                        name="datetimetz"
                        label="Date-Time Tz"
                        component={RenderDateTimeTz}
                        timezoneFieldProps={{ name: "tz_field_name" }}
                        normalize={normalizeDatetime}
                    />
                    <Field
                        name="field"
                        label="Field"
                        component={RenderField}
                    />
                    <Field
                        name="fileupload"
                        label="File Upload"
                        component={RenderFileUpload}
                    />
                    <Field
                        name="groupcheckbox"
                        label="Group Checkbox"
                        component={RenderGroupCheckbox}
                        options={[
                            {
                                label: "Opt a",
                                value: "a"
                            }, {
                                label: "Opt b",
                                value: "b"
                            },
                            {
                                label: "Opt c",
                                value: "c"
                            }, {
                                label: "Opt d",
                                value: "d"

                            }]}
                    />
                    <Field
                        name="groupedselect"
                        label="Grouped Select"
                        component={RenderGroupedSelect}
                        data={[{
                            groupName: "Group 1",
                            opt: [{
                                label: "Opt 1a",
                                value: "a"
                            }, {
                                label: "Opt 1b",
                                value: "b"
                            }]
                        }, {
                            groupName: "Group 2",
                            opt: [{
                                label: "Opt 2c",
                                value: "c"
                            }, {
                                label: "Opt 2d",
                                value: "d"
                            }]
                        }]}
                    />
                    <Field
                        name="hiddenfield"
                        label="Hidden Field"
                        component={RenderHiddenField}
                    />
                    <Field
                        name="largeselect"
                        label="Large Select"
                        component={RenderLargeSelect}
                        dataSource={simpleOptions}
                        selectedOption={{ label: "Opt 4", value: "opt4" }}
                    />
                    <Field
                        name="multiselect"
                        label="Multi Select"
                        component={RenderMultiSelect}
                        data={simpleOptions}
                    />
                    <Field
                        name="orgbooksearch"
                        label="Orgbook Search"
                        component={RenderBCRegistrationSearch}
                        setCredential={jest.fn()}
                        data={[{
                            text: "Orgbook Option Label",
                            value: 12345
                        }]}
                    />
                    <Field
                        name="radiobuttons"
                        label="Radio Buttons"
                        component={RenderRadioButtons}
                        customOptions={simpleOptions}
                    />
                    <Field
                        name="richtexteditor"
                        label="Rich Text Editor"
                        component={RenderRichTextEditor}
                    />

                    <Field
                        name="select"
                        label="Select"
                        component={RenderSelect}
                        data={simpleOptions}
                    />
                    <Field
                        name="time"
                        label="Time"
                        component={RenderTime}
                    />
                    <Field
                        name="treeselect"
                        label="Tree Select"
                        component={RenderTreeSelect}
                        treeData={{}}
                    />
                    <FieldArray
                        name="field_array"
                        component={TestFieldArray}
                        props={{ testProp: "Prop Passed" }}
                    />
                    {/* Fields is only used in NoW in an edit context. Not bothering */}
                    {/* <Fields 
                    names={["fields_1", "fields_2"]}
                    id="test_fields"
                    dropdownID="dropdown-id"
                    component={RenderFieldWithDropdown}
                /> */}
                    <FormSection name="section">
                        <Field
                            name="sectionfield"
                            label="Section Field"
                            component={RenderField}
                        />
                        <FormSection name="subsection">
                            <Field
                                name="subsectionfield"
                                label="Subsection Field"
                                component={RenderField}
                            />
                        </FormSection>
                    </FormSection>
                    <FormSection name="nest">
                        <FieldArray
                            name="nest_array"
                            component={TestNested}
                            props={{ testProp: "Nested!" }}
                        />
                    </FormSection>
                    <RenderResetButton />
                    <RenderSubmitButton />
                    <RenderCancelButton />
                </FormWrapper>
            </ReduxWrapper>
        );
        expect(container).toMatchSnapshot();
    });
});