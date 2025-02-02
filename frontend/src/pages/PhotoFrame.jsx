import "./PhotoFrame.css";
import MainHeader from "../components/common/MainHeader";
import FrameSwipe from "../components/frame/FrameSwipe";
import { useEffect, useRef, useState } from "react";
import InputFrameImg from "../components/common/InputFrameImg";
import PhotoFrameModalFrame from "./modalFrame/PhotoFrameModalFrame";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas-pro";
import LoadingModal from "./LoadingModal";
import download from "../assets/img/download.png"
import frame_black from "../assets/img/frame-black.png";
import frame_white_black from "../assets/img/frame-white-black.png";
import frame_white_purple from "../assets/img/frame-white-purple.png";
import frame_purple from "../assets/img/frame-purple.png";
import frame_pink from "../assets/img/frame-pink.png";
import frame_hotpink from "../assets/img/frame-hotpink.png";
import rectangle from "../assets/img/rectangle.png"

const PhotoFrame = () => {
  const [selectFrame, setSelectFrame] = useState(0);
  const { boardID } = useParams();

  const [imgUrls, setImgUrls] = useState([
    {rectangle},
    {rectangle},
    {rectangle},
    {rectangle},
  ]);

  const [slotNum, setSlotNum] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isIconVisible, setIsIconVisible] = useState([true, true, true, true]);
  const inputFrameImgRef = useRef(null);

  const downloadPhotoFrame = () => {
    if (inputFrameImgRef.current) {
      const selectedFrameElement = document.querySelector(".selected-frame");
      if (selectedFrameElement) {
        selectedFrameElement.style.position = "relative";
      }
      html2canvas(inputFrameImgRef.current, {
        useCORS: true,
        backgroundColor: "white", // 투명 배경으로 설정
        scale: 4,
      })
        .then((canvas) => {
          if (selectedFrameElement) {
            selectedFrameElement.style.position = "";
          }

          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "photo-frame.png";
          link.click();
          setLoading(false);
        })
        .catch((error) => {
          console.error("oops, something went wrong!", error);
        });
    }
  };

  useEffect(() => {
    if (loading) {
      downloadPhotoFrame();
    }
  }, [loading]);

  return (
    <div className="w-full h-full flex flex-wrap relative">
      {loading ? <LoadingModal /> : null}
      {slotNum !== 0 ? (
        <PhotoFrameModalFrame
          id={boardID}
          slotNum={slotNum}
          setSlotNum={setSlotNum}
          setImgUrls={setImgUrls}
          imgUrls={imgUrls}
          setIsIconVisible={setIsIconVisible}
          isIconVisible={isIconVisible}
        />
      ) : null}
      <div className="photo-frame-header">
        <MainHeader
          title={"PhotoFrame"}
          icon={
            <img
              src={download}
              alt="thirdIcon"
              className="header-icon"
              style={{ width: "38%", marginLeft: "7vw" }}
            />
          }
          page="포토프레임"
          setLoading={setLoading}
        />
      </div>

      <div className="photo-frame-body">
        <div className="photo-capture" ref={inputFrameImgRef}>
          <img
            className="selected-frame"
            src={frames[selectFrame].src}
            alt={frames[selectFrame].type}
          />
          <InputFrameImg
            imageUrls={imgUrls}
            isIconVisible={isIconVisible}
            setSlotNum={setSlotNum}
          />
        </div>
      </div>
      <div className="photo-frame-footer">
        <FrameSwipe frames={frames} setSelectFrame={setSelectFrame} />
      </div>
    </div>
  );
};

const frames = [
  {
    src: {frame_black},
    type: "black",
  },
  {
    src: {frame_white_black},
    type: "white-black",
  },
  {
    src: {frame_white_purple},
    type: "white-purple",
  },
  {
    src: {frame_purple},
    type: "purple",
  },
  {
    src: {frame_pink},
    type: "pink",
  },
  {
    src: {frame_hotpink},
    type: "hot-pink",
  },
];

export default PhotoFrame;
