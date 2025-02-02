import React, { useEffect, useState } from "react";
import "./InputFrameImg.css";
import edit_image from "../../assets/img/edit-image.png"

const InputFrameImg = ({ imageUrls, isIconVisible, setSlotNum }) => {
  // 슬롯을 클릭할 때 아이콘을 숨기고, 슬롯 번호를 설정하는 함수
  const handleSlotClick = (slotNumber) => {
    setSlotNum(slotNumber); // 슬롯 번호 설정
  };

  return (
    <div className="input-frame-container">
      <div className="frame-slot top-left">
        {isIconVisible[0] && (
          <img
            style={{
              width: "3.5vh",
              height: "3.5vh",
              margin: "auto",
              padding: "69px 0 69px 5px",
            }}
            src={edit_image}
            alt="icon"
          />
        )}
        <img src={imageUrls[0]} alt="slot1" />
        <div className="click-overlay" onClick={() => handleSlotClick(1)} />
      </div>
      <div className="frame-slot top-right">
        {isIconVisible[1] && (
          <img
            style={{
              width: "3.5vh",
              height: "3.5vh",
              margin: "auto",
              padding: "69px 0 69px 5px",
            }}
            src={edit_image}
            alt="icon"
          />
        )}
        <img src={imageUrls[1]} alt="slot2" />
        <div className="click-overlay" onClick={() => handleSlotClick(2)} />
      </div>
      <div className="frame-slot bottom-left">
        {isIconVisible[2] && (
          <img
            style={{
              width: "3.5vh",
              height: "3.5vh",
              margin: "auto",
              padding: "69px 0 69px 5px",
            }}
            src={edit_image}
            alt="icon"
          />
        )}
        <img src={imageUrls[2]} alt="slot3" />
        <div className="click-overlay" onClick={() => handleSlotClick(3)} />
      </div>
      <div className="frame-slot bottom-right">
        {isIconVisible[3] && (
          <img
            style={{
              width: "3.5vh",
              height: "3.5vh",
              margin: "auto",
              padding: "69px 0 69px 5px",
            }}
            src={edit_image}
            alt="icon"
          />
        )}
        <img src={imageUrls[3]} alt="slot4" />
        <div className="click-overlay" onClick={() => handleSlotClick(4)} />
      </div>
    </div>
  );
};

export default InputFrameImg;
