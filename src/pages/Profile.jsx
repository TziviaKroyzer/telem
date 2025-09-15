// Profile.jsx

import React from "react";
import UserNameHeader from "../components/UserNameHeader";
import UserCommentsList from "../components/UserCommentsList";

export default function Profile() {
  return (
    <div>
      <UserNameHeader />
      <UserCommentsList />
    </div>
  );
}
