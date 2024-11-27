import React, { FC, useEffect, useRef, useState } from "react";
import { Form } from "antd";
import { Field } from "redux-form";
import { maxLength, required } from "@mds/common/redux/utils/Validate";
import { IPermitConditionCategory } from "@mds/common/interfaces";
import RenderAutoComplete from "@mds/common/components/forms/RenderAutoComplete";
import { useDispatch, useSelector } from "react-redux";
import { searchConditionCategories, getConditionCategories } from "@mds/common/redux/slices/permitConditionCategorySlice";
import { debounce, DebouncedFunc } from "lodash";


export interface IPermitConditionCategorySelectorProps {
  showLabel?: boolean;
}

const PermitConditionCategorySelector: FC<IPermitConditionCategorySelectorProps> = (props: IPermitConditionCategorySelectorProps) => {
  const dispatch = useDispatch();
  const categories = useSelector(getConditionCategories);
  const [loading, setLoading] = useState(false);

  const categoryOptions = categories?.map((category: IPermitConditionCategory) => ({
    value: category.description,
    label: category.description,
  })) ?? [];

  const searchCategories = async (search: string) => {
    setLoading(true);
    try {
      await dispatch(searchConditionCategories({ query: search }));
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch: DebouncedFunc<typeof searchCategories> = debounce(searchCategories, 1000);
  const handleSearchDebounced = useRef(debouncedSearch).current;
  const showLabel = props.showLabel !== undefined ? props.showLabel : true;

  return (
    <Form.Item style={{ marginRight: 0 }}>
      <Field
        id="description"
        name="description"
        label={showLabel ? "Category Name" : null}
        validate={[required, maxLength(255)]}
        required={true}
        data={categoryOptions}
        loading={loading}
        handleChange={handleSearchDebounced}
        handleSelect={() => { }}
        component={RenderAutoComplete}
        addMissing={true}
        style={{ marginRight: 0 }}
      />
    </Form.Item>
  );
};

export default PermitConditionCategorySelector;
