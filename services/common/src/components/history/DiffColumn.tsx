import React from "react";
import { Typography } from "antd";
import { formatSnakeCaseToSentenceCase } from "@mds/common/redux/utils/helpers";
import { DiffColumnProps } from "./DiffColumn.interface";

const DiffColumn: React.FC<DiffColumnProps> = ({ differences, valueMapper }) => {
  const valueOrNoData = (value: any) => {
    if (typeof value === "boolean") {
      return value ? "True" : "False";
    }
    return value ? value : "No Data";
  };

  /**
   * Maps the diff titles and values to a more user-friendly format based on the given valueMapper.
   * If a valueMapper is not provided or a the given field does not have a corresponding mapping,
   * the field_name will be formatted to sentence case for easier readability.
   */
  const mappedDifferences = differences.map((change) => {
    const mapper = valueMapper ? valueMapper[change.field_name] : null;
    const fromMapped = mapper?.data?.find((data) => data.value === change.from);
    const toMapped = mapper?.data?.find((data) => data.value === change.to);

    return {
      field_name: mapper?.title ?? formatSnakeCaseToSentenceCase(change.field_name, "_"),
      from: fromMapped?.label || change.from,
      to: toMapped?.label || change.to,
    };
  });

  return (
    <div className="padding-md--top">
      {mappedDifferences.map((diff) => (
        <div key={diff.field_name}>
          {diff.field_name === "Documents" ? (
            <div>
              <Typography.Paragraph strong className="margin-none line-height-none">
                Files Added:
              </Typography.Paragraph>
              {diff.to.map((file: any, index) => (
                <Typography.Paragraph
                  key={`${file}${index}`}
                  className="green margin-none line-height-none"
                >
                  {file}
                </Typography.Paragraph>
              ))}
            </div>
          ) : (
            <div>
              <Typography.Paragraph strong className="margin-none line-height-none">
                {diff.field_name}:
              </Typography.Paragraph>
              {diff.field_name !== "None" && (
                <Typography.Paragraph>
                  <Typography.Text className="red">{valueOrNoData(diff.from)}</Typography.Text>
                  {` => `}
                  <Typography.Text className="green">{valueOrNoData(diff.to)}</Typography.Text>
                </Typography.Paragraph>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DiffColumn;
