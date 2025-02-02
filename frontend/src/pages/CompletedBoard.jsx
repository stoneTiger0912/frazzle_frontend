import { useEffect, useState } from "react";
import "./CompletedBoard.css";
import boardApi from "../apis/boardApi";
import userApi from "../apis/userApi";
import MainHeader from "../components/common/MainHeader";
import MainNav from "../components/common/MainNav";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DirectoryCanvasCopy from "../components/directory/DirectoryCanvasCopy";
import PhotoFrameModalFrame from "./modalFrame/PhotoFrameModalFrame";
import BoardDeleteModalFrame from "./../pages/modalFrame/BoardDeleteModalFrame";
import trash from "../assets/img/trash.png"
import thumbnail from "../assets/img/thumbnail.png"
import four_cut from "../assets/img/four-cut.png"
import album from "../assets/img/album.png"
const CompletedBoard = ({ boardID }) => {

  let directoryId = useSelector(state => state.createBoard.directoryId);
  let navigate = useNavigate();

  // 넘겨받은 boardID를 이용해서 화면에 보여줄 정보를 State로 저장 (접속한 유저 정보도 포함)
  let [keyword, setKeyword] = useState([]);
  let [category, setCategory] = useState('');
  let [directoryName, setDirectoryName] = useState('');
  let [boardNum, setBoardNum] = useState('');
  let [boardSize, setBoardSize] = useState('');
  let [thumbnailer, setThumbnailer] = useState('');
  let [boardClearType, setBoardClearType] = useState('');
  let [userNickname, setUserNickname] = useState('');
  // 썸네일 아이콘 클릭 시 모달창 띄우는 스위치
  let [thumbnailModal, setThumbnailModal] = useState(false);
  // 썸네일 이미지 수정 트리거
  let [tnTrigger, setTnTrigger] = useState(0);
  // 썸네일 URL 저장소 (null이 저장될 수 있다.)
  let [thumbnailURL, setThumbnailURL] = useState('');
  // 휴지통 아이콘 클릭 시 모달창 띄우는 스위치
  let [deleteModal, setDeleteModal] = useState(false);
  let [voteStatus, setVoteStatus] = useState(true);

  // 넘겨받은 boardID를 이용해서 화면에 보여줄 정보를 State로 저장 (접속한 유저 정보도 포함)
  const setInfo = async (boardID) => {
    try {
      const response = await boardApi.get(`/${boardID}`);
      const userResponse = await userApi.get();

      const keyword = response.data.data.keyword;
      setKeyword(keyword);
      const category = response.data.data.category;
      setCategory(category);
      const directoryName = response.data.data.directoryName;
      setDirectoryName(directoryName);
      const boardNum = response.data.data.boardNum;
      setBoardNum(boardNum);
      const boardSize = response.data.data.boardSize;
      setBoardSize(boardSize);
      const thumbnailer = response.data.data.thumbnailer;
      setThumbnailer(thumbnailer);
      const boardClearType = response.data.data.boardClearType;
      setBoardClearType(boardClearType);
      const voteStatus = response.data.data.voteStatus;
      setVoteStatus(voteStatus);
      const nickname = userResponse.data.data.nickname;
      setUserNickname(nickname);

    } catch (error) {
      console.error("Error fetching board data:", error);
    }
  };

  // 썸네일 URL 조회
  const getThumbnail = async () => {
    // boardID로 썸네일 URL 조회하는 GET 요청
    try {
      // 백엔드에 바로 GET 요청을 보내기
      const response = await boardApi.get(`/${boardID}/thumbnails`);

      // 우선 변수에 담기 (URL은 null일 수 있음)
      const URL = response.data.data.url;
      // 이어서 State에 담기
      setThumbnailURL(URL);
    } catch (error) {
      console.error('Error getting thumbnail URL', error);
      throw error;
    }
  }

  // 넘겨받은 boardID를 이용해서 화면에 보여줄 정보를 State로 저장 (접속한 유저 정보도 포함)
  useEffect(() => {
    setInfo(boardID);
  }, []);

  // SelectPhoto Component의 Trigger로 useEffect 발동
  // 썸네일 사진 GET 요청 불러와서 그 URL 이미지로 캔버스 덮기
  /* DirectoryCanvasCopy Component에서 직접 Thumnail Image를 조회하지 않고 이 컴포넌트에서 조회하여 props로 건네주는 이유는
  전자의 경우에도 boardID를 props로 건네주어야 하며, axios 요청 로딩 로직을 이 컴포넌트 상에서 적용시키려면 이 컴포넌트에서 axios 요청을 하는 것이 좋기 때문이다. */
  useEffect(() => {
    getThumbnail();
  }, [tnTrigger])

  return (
    <div className="completed-board w-full h-full relative">
      {deleteModal ?
        <BoardDeleteModalFrame setDeleteModal={setDeleteModal} /> : null }
      {thumbnailModal ?
        <PhotoFrameModalFrame
          id={boardID}
          setThumbnailModal={setThumbnailModal}
          setTnTrigger={setTnTrigger}
          /> : null}
      <div className="completed-board-header">
        <MainHeader
          path={`/directories/${directoryId}`}
          title={`${directoryName} #${boardNum}`}
          category={category}
          icon={
            !voteStatus ?
            <img
              src={trash}
              alt="trashIcon"
              className="header-icon"
              style={{ width: "40%", marginLeft: "7vw" }}
              onClick={(e) => { e.stopPropagation(); setDeleteModal(true); }}
            /> : null
          }
        />
      </div>
      <div className="completed-board-body">
        <div className="completed-board-body-top">
          {keyword ?
            <div className="completed-board-body-top-keyword-container">
              {
                keyword.map((each, index) => {
                  return (
                    <div key={index} className="completed-board-body-top-keyword-item">
                      #{each}
                    </div>
                  )
                })
              }
            </div> : null}
          <div className={keyword ? "completed-board-body-top-title-with-keyword-item" : "completed-board-body-top-title-without-keyword-item"}>
            <span>{directoryName} 디렉토리의</span>
            <span>{boardNum}번째 퍼즐판이</span>
            <span>완성되었어요!</span>
          </div>
        </div>
        <div className="completed-board-body-bottom">
          <div className="completed-board-body-bottom-feature-container">
            {userNickname == thumbnailer ?
              <div className="completed-board-body-bottom-icon-container" onClick={(e) => {
                e.stopPropagation();
                setThumbnailModal(true);
              }}>
                <span style={{whiteSpace: 'nowrap'}}>썸네일</span>
                <img src={thumbnail} />
              </div> : null}
            <div className="completed-board-body-bottom-icon-container" onClick={(e) => {
              e.stopPropagation();
              navigate(`/photo-frame/${boardID}`);
            }}>
              <span style={{whiteSpace: 'nowrap'}}>네컷사진</span>
              <img src={four_cut} />
            </div>
            <div className="completed-board-body-bottom-icon-container" onClick={(e) => {
              e.stopPropagation();
              navigate(`/album/${boardID}`);
            }}>
              <span style={{whiteSpace: 'nowrap'}}>앨범</span>
              <img src={album} />
            </div>
          </div>
          <div className="completed-board-body-bottom-canvas-container">
            {/* 퍼즐판 캔버스 삽입 */}
            <DirectoryCanvasCopy boardSize={boardSize} thumbnailURL={thumbnailURL} />
          </div>
        </div>
      </div>
      <div className="completed-board-footer">
        <MainNav />
      </div>
    </div>
  )
}

export default CompletedBoard;