import moment from "moment";

// Function to format an API date string to human readable
export const formatDate = (dateString) =>
  dateString &&
  dateString !== "9999-12-31" &&
  dateString !== "None" &&
  moment(dateString, "YYYY-MM-DD").format("MMM DD YYYY");
