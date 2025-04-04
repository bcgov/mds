import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { Field } from "@mds/common/components/forms/form";
import { getSearchUsers, searchUsers } from "@mds/common/redux/slices/userSlice";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import { IOption } from "@mds/common/interfaces";

interface UserSelectFieldProps {
  id?: string;
  name: string;
  label?: string;
  initialDataSource?: { value: string; label: string }[];
  validate?: any[];
  disabled?: boolean;
  required?: boolean;
  onSelect?: (value: any, option: any) => void;
  loading?: boolean;
}

const transformUserData = (users) => {
  if (!users || users.length === 0) return [];
  return users.map((user) => ({
    value: user.sub,
    label: user.display_name,
  }));
};

export const UserSelectField: FC<UserSelectFieldProps> = ({
  onSelect = () => { },
  validate = [],
  disabled = false,
  required = false,
  loading = false,
  label = "User",
  initialDataSource,
  ...rest
}) => {
  const dispatch = useDispatch();
  const searchResults = useSelector(getSearchUsers);

  const [userDataSource, setUserDataSource] = useState<IOption[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (initialDataSource) {
      setUserDataSource(initialDataSource);
    }
  }, [initialDataSource]);

  useEffect(() => {
    if (searchResults) {
      setSearching(false);
      const transformedData = transformUserData(searchResults);
      setUserDataSource(transformedData);
    }
  }, [searchResults]);

  const handleFetchSearchResults = useCallback(
    (searchTerm: string) => {
      setSearching(true);
      dispatch(searchUsers(searchTerm));
    },
    [dispatch]
  );

  const debouncedSearch = useMemo(
    () => debounce(handleFetchSearchResults, 300),
    [handleFetchSearchResults]
  );

  const handleSearch = (value: string) => {
    if (value.length >= 2) {
      debouncedSearch(value);
    }
  };


  return (
    <Field
      name={rest.name}
      validate={validate}
      id={rest.id}
      data={userDataSource}
      placeholder="Search for a user"
      loading={searching || loading}
      disabled={disabled}
      required={required}
      allowClear={false}
      enableGetPopupContainer={false}
      onSearch={handleSearch}
      component={RenderSelect}
    />
  );
};

export default UserSelectField;
