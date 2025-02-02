import "./SelectPhoto.css";
import { useEffect, useState } from "react";
import boardApi from "./../../apis/boardApi";
import x_symbol from "../../assets/img/x-symbol.png"
import edit_image from "../../assets/img/edit-image.png"

const SelectPhoto = ({
  id,
  setSlotNum,
  imgUrls,
  setImgUrls,
  slotNum,
  setIsIconVisible,
  setThumbnailModal,
  setTnTrigger,
  isIconVisible,
}) => {
  const [imgList, setImgList] = useState([]);
  const [selectImg, setSelectImg] = useState(-1);

  // Thumbnail 수정
  const putThumbnail = async () => {
    // boardID(id)로 썸네일 수정하는 PUT 요청
    try {
      // Request Body 데이터 가공
      const url = imgList[selectImg].imgUrl;
      const requestData = {
        thumbnailUrl: url,
      };
      // 백엔드에 PUT 요청을 보내기
      const response = await boardApi.put(`/${id}/thumbnails`, requestData);

      // 마지막은 모달창 닫기
      setThumbnailModal(false);
      // CompletedBoard Component에서 감지할 수 있게끔(useEffect를 사용할 수 있게끔) Trigger 발동시키기
      setTnTrigger(1);
    } catch (error) {
      console.error("Error putting thumbnails", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAllImages = async () => {
      const response = await boardApi.get(`/${id}/images`);
      const data = response.data.data;

      setImgList(data.imgList);
    };

    fetchAllImages();
  }, []);

  const rows = [];
  for (let i = 0; i < imgList.length; i += 2) {
    rows.push(imgList.slice(i, i + 2));
  }

  const setImgFrame = () => {
    const newImgUrl = [...imgUrls];
    newImgUrl[slotNum - 1] = imgList[selectImg].imgUrl;

    const newIsIconVisible = [...isIconVisible];
    newIsIconVisible[slotNum - 1] = false;
    setIsIconVisible(newIsIconVisible);
    setImgUrls(newImgUrl);
    setSlotNum(0);
  };

  return (
    <div className="select-photo-modal flex flex-wrap">
      <div className="select-photo-modal-header">
        <img
          src={edit_image}
          alt="edit-icon"
          className="select-photo-edit-icon"
        />
        <span className="select-photo-title">사진 선택</span>
        <img
          src={x_symbol}
          alt="x-symbol"
          className="x-symbol"
          onClick={() => {
            if (setSlotNum) {
              setSlotNum(0);
            }
            if (setThumbnailModal) {
              setThumbnailModal(false);
            }
          }}
        />
      </div>
      <div className="result-photo-modal-body">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="result-photo-row">
            {row.map((imgSrc, colIndex) => (
              <div
                key={colIndex}
                className="photo-container"
                onClick={() => setSelectImg(rowIndex * 2 + colIndex)}
                style={{
                  borderColor:
                    selectImg === rowIndex * 2 + colIndex
                      ? "#c3c7f4"
                      : "#F6F6F6",
                }}
              >
                <img
                  className="photo-img"
                  src={imgSrc.imgUrl}
                  alt={`img-${rowIndex}-${colIndex}`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        className="result-photo-button"
        disabled={selectImg === -1}
        onClick={() => {
          if (setSlotNum && imgUrls && setImgUrls && slotNum) {
            setImgFrame();
          } else {
            putThumbnail();
          }
        }}
      >
        선택하기
      </button>
    </div>
  );
};

export default SelectPhoto;
