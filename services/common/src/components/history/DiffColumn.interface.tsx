export interface IDiffColumn {
  field_name: string;
  from: any;
  to: any;
}

export interface IDiffEntry {
  updated_by: string;
  updated_at: Date;
  changeset: IDiffColumn[];
}

/**
 * Used to map the diff titles and values to a more user-friendly format
 *
 * Example structure:
 * {
 *   storage_location: {
 *     title: "Storage Location"
 *     data: [
 *        { value: "above_ground", label: "Above Ground" },
 *        { value: "below_ground", label: "Underground" }
 *     ]
 *   },
 * }
 */
export interface DiffColumnValueMapper {
  [key: string]: {
    title: string;
    data?: { value: string; label: string }[];
  };
}

export interface DiffColumnProps {
  differences: IDiffColumn[];
  valueMapper?: DiffColumnValueMapper;
}
