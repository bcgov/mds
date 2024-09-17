import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Button, Form, Input } from "antd";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/index";

interface CommentEditorProps {
  onSubmit: (data: any) => void;
  addCommentPermission: string;
  maxLength?: number;
}

export const CommentEditor: FC<CommentEditorProps> = ({
  onSubmit,
  addCommentPermission,
  maxLength = 300,
}) => {
  const userRoles = useSelector(getUserAccessData);

  const [submitting, setSubmitting] = React.useState(false);
  const [comment, setComment] = React.useState("");

  const handleReset = () => {
    setComment("");
    setSubmitting(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    await onSubmit({ comment });
    handleReset();
  };

  const handleChange = (e) => {
    setComment(e.target.value);
  };

  const canAddComment = addCommentPermission
    ? userRoles.includes(USER_ROLES[addCommentPermission])
    : true;

  return (
    <div>
      {canAddComment && (
        <Form.Item>
          <Input.TextArea
            rows={4}
            placeholder="Enter your comment here"
            showCount
            maxLength={maxLength}
            onChange={handleChange}
            value={comment}
            name="comment"
          />
        </Form.Item>
      )}

      {canAddComment && (
        <Button
          disabled={comment === ""}
          htmlType="button"
          loading={submitting}
          onClick={handleSubmit}
          type="primary"
        >
          Add Comment
        </Button>
      )}
    </div>
  );
};

export default CommentEditor;
