import React, { FC, useEffect, useRef, useState } from "react";
import { Form } from "antd";
import { Field } from "redux-form";
import { required } from "@mds/common/redux/utils/Validate";
import { IPermitConditionCategory } from "@mds/common/interfaces";
import RenderAutoComplete from "@mds/common/components/forms/RenderAutoComplete";
import { useDispatch, useSelector } from "react-redux";
import { searchConditionCategories, getConditionCategories } from "@mds/common/redux/slices/permitConditionCategorySlice";
import { debounce, DebouncedFunc } from "lodash";


const PermitConditionCategorySelector: FC = () => {
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

  return (
    <Form.Item>
      <Field
        id="description"
        name="description"
        label="Category Name"
        validate={[required]}
        required
        data={categoryOptions}
        loading={loading}
        handleChange={handleSearchDebounced}
        component={RenderAutoComplete}
        addMissing={true}
      />
    </Form.Item>
  );
};

export default PermitConditionCategorySelector;
