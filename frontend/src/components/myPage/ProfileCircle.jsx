import "./ProfileCircle.css";
import React, { useRef, useState, useEffect } from "react";
import userApi from "../../apis/userApi";
import { useSelector, useDispatch } from "react-redux";
import { setProfileImg } from "../../stores/userSlice";
import compressImage from "../../utils/compressImg";
import camera_logo from "../../assets/img/camera-logo.png";

const ProfileCircle = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [profileSrc, setProfileSrc] = useState(null);
  const [availableSize, setAvailableSize] = useState(true);

  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      if (file.size >= 1024 * 1024 * 10) {
        setAvailableSize(false);
        return;
      }
      // 이미지 압축
      const compressedImage = await compressImage(file);
      // 백으로 데이터 전달
      const formData = new FormData();
      formData.append("profileImg", compressedImage);

      const response = await userApi.put("/profile-img", formData);
      dispatch(setProfileImg(response.data.data.profileImg));
    }
  };
 
  
  useEffect(() => {
    setProfileSrc(user.profileImg);
  }, [user.profileImg]);

  return (
    <>
      <div
        className="profile-circle"
        style={{
          backgroundImage: profileSrc ? `url(${profileSrc})` : "none",
        }}
      >
        {profileSrc ? "" : "동그라미"}
      </div>
      <img
        src={ camera_logo}
        alt="camera-logo"
        onClick={handleClick}
        className="profile-icon"
        style={{ cursor: "pointer", width: "5vh" }}
      />
      {!availableSize ? <span>10MB 미만의 사진만 가능합니다. </span> : null}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

export default ProfileCircle;
