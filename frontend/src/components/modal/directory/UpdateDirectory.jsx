import { useState, react, useEffect } from "react";
import "./UpdateDirectory.css";
import { useDispatch, useSelector } from "react-redux";
import { setModalId } from "../../../stores/directorySlice";
import ExceptionMessage from "../../common/ExceptionMessage";
import checkAvailableWord from "../../../utils/stringConfig/checkAvailableWord";
import chekcWordLength from "../../../utils/stringConfig/checkWordLength";
import directoryApi from "../../../apis/directoryApi";
import { useParams } from "react-router-dom";
import x_symbol from "../../../assets/img/x-symbol.png";
import edit from "../../../assets/img/edit.png"

const UpdateDirectory = () => {
  const dispatch = useDispatch();
  const directory = useSelector((state) => state.directory);
  const { id } = useParams();

  // 사용자의 input 저장
  const [inputDirectoryName, setInputDirectoryName] = useState("");
  // 1(유효하지 않은 형식), 2(길이 초과), 3(사용 가능). => 예외 동적 UI를 위한 state
  const [exceptionMessage, setExceptionMessage] = useState(0);

  useEffect(() => {
    if (inputDirectoryName === "") {
      setExceptionMessage(0);
    } else if (!chekcWordLength(inputDirectoryName, 32)) {
      setExceptionMessage(2);
    } else if (!checkAvailableWord(inputDirectoryName)) {
      setExceptionMessage(1);
    } else {
      setExceptionMessage(3);
    }
  }, [inputDirectoryName]);

  const updateDirectoryName = async () => {
    const data = {
      directoryName: inputDirectoryName,
    };
    const response = await directoryApi.put(`/${id}`, data);
    dispatch(setModalId(0));
  };

  return (
    <div className="update-directory-modal flex flex-wrap">
      <div className="update-directory-modal-header flex">
        <img
          src={edit}
          alt="folder-icon"
          className="folder-icon"
        />
        <span className="create-directory-modal-title">디렉토리 이름 수정</span>
        <img
          src={x_symbol}
          alt="x-symbol"
          className="x-symbol"
          onClick={() => dispatch(setModalId(0))}
        />
      </div>
      <div className="update-directory-modal-body">
        <div className="input-update-directory-name">
          <span>디렉토리 이름을 수정해주세요.</span>
          <input
            type="text"
            className="update-directory-input"
            placeholder={directory.directoryName}
            onChange={(e) => setInputDirectoryName(e.target.value)}
          />
          <ExceptionMessage exceptionMessage={exceptionMessage}/>
        </div>
        <button
          className="update-directory-button"
          disabled={exceptionMessage !== 3}
          onClick={updateDirectoryName}
        >
          수정하기
        </button>
      </div>
    </div>
  );
};

export default UpdateDirectory;
