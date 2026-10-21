import React from "react";
import { Input } from "antd";
import { ColumnType } from "antd/lib/table";

export interface IPermitPackageTitles {
  titles: { [key: string]: string };
  onTitleChange?: (key: string, value: string) => void;
}

// Title column for the Create Final Application Package modal.
// Selected rows get an input, as a title is required for permit package documents.
export const renderPermitPackageTitleColumn = ({
  selectedKeys = [],
  lockedRowKeys = [],
  packageTitles,
}: {
  selectedKeys?: string[];
  lockedRowKeys?: string[];
  packageTitles?: IPermitPackageTitles;
}): ColumnType<any> => {
  return {
    title: "Title",
    key: "package_title",
    render: (text: string, record) => {
      const title = packageTitles?.titles?.[record.key] ?? record.preamble_title ?? "";
      const isSelected = selectedKeys.includes(record.key);
      const isLocked = lockedRowKeys.includes(record.key);

      if (!isSelected || isLocked || !packageTitles?.onTitleChange) {
        return <div title="Title">{title}</div>;
      }

      return (
        <div title="Title">
          <Input
            id={`${record.key}_package_title`}
            aria-label="Title"
            placeholder="Title (required)"
            value={title}
            status={!title.trim() ? "error" : undefined}
            onChange={(e) => packageTitles.onTitleChange(record.key, e.target.value)}
          />
        </div>
      );
    },
  };
};

export const allSelectedHaveTitles = (
  selectedKeys: string[] = [],
  lockedRowKeys: string[] = [],
  titles: { [key: string]: string } = {}
): boolean => {
  return selectedKeys
    .filter((key) => !lockedRowKeys.includes(key) && key in titles)
    .every((key) => !!titles[key]?.trim());
};
