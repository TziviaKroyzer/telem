import React from "react";
import UserNameHeader from "../components/UserNameHeader";
import UserCommentsList from "../components/UserCommentsList";

export default function Profile() {
  return (
    <div className="profile-page">
      <style>{`
        .profile-page {
          width: 100%;
          margin: 0 auto;
        }
        .profile-hero { padding-bottom: 8px; }
      `}</style>
      <div className="profile-hero">
        <div className="page-badge"><span />משימות אישיות</div>
        <UserNameHeader />
      </div>
      <UserCommentsList />
    </div>
  );
}
