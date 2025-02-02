import react, { useState, useRef, useEffect } from "react";
import { setPieceId } from "../../../stores/pieceSlice";
import "./ChooseImg.css";
import pieceApi from "../../../apis/pieceApi";
import { useSelector, useDispatch } from "react-redux";
import compressImage from "../../../utils/compressImg";
import ImgExceptionMessage from "../../common/ImgExceptionMessage";
import { setImgLoading } from "../../../stores/loadingSlice";
import x_symbol from "../../../assets/img/x-symbol.png";
import edit_image from "../../../assets/img/edit-image.png"

const ChooseImg = () => {
  const piece = useSelector((state) => state.piece);
  const dispatch = useDispatch();

  const [imgUrl, setImgUrl] = useState(null);
  // 사용자의 input 저장
  const [comment, setComment] = useState("");
  // 0(아무것도 입력 X), 1(공백 포함 문자 20자 이내일 때), 2(그 외 길이가 너무 길 때)
  const [exceptionMessage, setExceptionMessage] = useState(0);
  const [imgFile, setImgFile] = useState(null);
  const [mission, setMission] = useState("");
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // 이미지 압축
      const compressedImage = await compressImage(file);
      setImgFile(compressedImage);
    }
  };

  const handleImgText = (e) => {
    const value = e.target.value;
    setComment(value);
  };

  useEffect(() => {
    if (piece.pieceId === 0) {
      setComment("");
      setImgUrl("");
      setMission("");
    } else {
      setComment(piece.comment);
      setImgUrl(piece.imgUrl);
      setMission(piece.mission);
    }
  }, [piece.pieceId, piece.comment, piece.imgUrl]);

  useEffect(() => {
    if (comment === "") {
      setExceptionMessage(0);
    } else if (comment.length <= 20) {
      setExceptionMessage(1);
    } else {
      setExceptionMessage(2);
    }
  }, [comment]);

  const fetchSaveImg = async () => {
    // 사진이 없을 경우 에러 메시지 출력
    if (imgFile === null && imgUrl === null) return;
    try {
      dispatch(setImgLoading(true));
      const formData = new FormData();
      formData.append("imgFile", imgFile);
      formData.append("comment", comment);

      const response = await pieceApi.put(`/${piece.pieceId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });


      dispatch(setPieceId(0));
      dispatch(setImgLoading(false));
    } catch (error) {
      dispatch(setImgLoading(false));
      dispatch(setPieceId(0));
      alert("다른 유저의 조각입니다. 다른 조각을 이용해 주세요");
      console.error("이미지 저장에 실패했습니다:", error);
    }
  };

  return (
    <div className="create-board-modal">
      <div className="create-board-modal-header flex">
        <img
          src={x_symbol}
          alt="x-symbol"
          className="x-symbol"
          onClick={() => dispatch(setPieceId(0))}
        />
      </div>
      <div className="create-choose-img-modal-body">
        {mission ? (
          <div className="mission-container">
            <span className="mission-title">Mission</span>
            <span className="mission-context">{mission}</span>
          </div>
        ) : null}
        <div className="uploading-img" onClick={handleClick}>
          {imgUrl ? (
            <img src={imgUrl} alt="new-img" className="uploaded-img" />
          ) : (
            <div className="choose-img-container">
              <img
                className="choose-img"
                src={edit_image}
                alt="edit-image-photo"
              />
              <span>Upload Photos</span>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/gif"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="image-description">
          <span className="image-description-span">
            덧붙이고 싶은 설명을 적어주세요.
          </span>
          <input
            className="image-description-input"
            type="text"
            value={comment}
            onChange={handleImgText}
          />
          <ImgExceptionMessage exceptionMessage={exceptionMessage} />
        </div>
      </div>

      <div className="choose-img-buttons">
        <button onClick={fetchSaveImg}>등록</button>
      </div>
    </div>
  );
};

export default ChooseImg;
