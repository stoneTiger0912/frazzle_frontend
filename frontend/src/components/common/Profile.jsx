import "./Profile.css";
import React, { useRef, useState, useEffect } from "react";
import makeNickNameShort from "../../utils/makeNickNameShort";
import profile_default from "../../assets/img/profile-default.png"

const Profile = ({ imgUrl, userName }) => {
  const [profileImgUrl, setProfileImgUrl] = useState(
    profile_default
  );
  const [profileName, setProfileName] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (imgUrl !== null) setProfileImgUrl(imgUrl);
    setProfileName(makeNickNameShort(userName));
  }, [imgUrl, userName]);

  return (
    <div className="profile-container">
      <div
        className="profile-circle"
        style={{
          backgroundImage: `url(${profileImgUrl})`,
        }}
      ></div>
      <span className="profile-name">{profileName}</span>
    </div>
  );
};

export default Profile;
