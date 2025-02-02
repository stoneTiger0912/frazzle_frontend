import { useNavigate, useParams } from "react-router-dom";
import MainNav from "../../components/common/MainNav";
import MainHeader from "../../components/common/MainHeader";
import MemberHeader from "../../components/directory/MemberHeader";
import "./Directory.css";

import { useEffect, useState } from "react";
import directoryApi from "../../apis/directoryApi";
import DirectoryCanvas from "../../components/directory/DirectoryCanvas";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useDispatch, useSelector } from "react-redux";
import { setDirectoryId } from "../../stores/createBoardSlice";
import { setDirectoryName } from "../../stores/directorySlice";
import DirectoryModalFrame from "../modalFrame/DirectoryModalFrame";
import { setMemberList } from "../../stores/directorySlice";
import edit from "../../assets/img/edit.png"
import plus from "../../assets/img/plus.png"

const Directory = () => {
  // url Parameter 이름과 동일하게 'id'를 사용해야 한다.
  const { id } = useParams();
  const nav = useNavigate();
  const dispatch = useDispatch();

  const [category, setCategory] = useState("");
  const [boardList, setBoardList] = useState([]);
  const [memberList, setMemberListState] = useState([]);
  const [addBoard, setAddBoard] = useState(true);

  const directory = useSelector((state) => state.directory);

  /* 디렉토리 상세페이지에 존재하는 퍼즐판 추가 버튼을 누르면 동률의 위치로
  페이지 라우팅되는 것이므로 고유 디렉토리 번호는 props로 전송 불가하다.
  따라서 디렉토리 상세페이지가 처음으로 mount될 때, Rudex에 고유 디렉토리 번호를 저장해야 한다. */
  useEffect(() => {
    // 주의 : id는 Number가 아닌 String Type
    dispatch(setDirectoryId(id));
  }, []);

  useEffect(() => {
    const fetchDirectory = async () => {
      const response = await directoryApi.get(`/${id}`);
      const data = response.data.data;

      setCategory(data.category);
      setBoardList(data.boardList);
      setMemberListState(data.memberList);
      setAddBoard(data.currentBoard);

      dispatch(setMemberList(data.memberList));
      dispatch(setDirectoryName(data.directoryName));
    };
    fetchDirectory();
  }, [id, directory.modalId]);

  /* 디렉토리 상세페이지에 존재하는 퍼즐판 추가 버튼을 누르면 동률의 위치로
  페이지 라우팅되는 것이므로 고유 디렉토리 번호는 props로 전송 불가하다.
  따라서 디렉토리 상세페이지가 처음으로 mount될 때, Rudex에 고유 디렉토리 번호를 저장해야 한다. */
  useEffect(() => {
    // 주의 : id는 Number가 아닌 String Type
    dispatch(setDirectoryId(id));
  }, []);

  // 슬라이드 설정
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: true,
    draggable: true,
  };

  // 클릭과 드래그 구분을 위한 상태 변수
  let mouseDownX = 0;
  let mouseUpX = 0;

  const handleMouseDown = (e) => {
    mouseDownX = e.clientX;
  };

  const handleMouseUp = (boardId) => (e) => {
    mouseUpX = e.clientX;
    if (mouseDownX === mouseUpX) {
      // 마우스 다운과 업의 X 좌표가 동일하면 클릭으로 간주
      nav(`/boards/${boardId}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-wrap relative">
      {directory.modalId !== 0 ? <DirectoryModalFrame /> : null}
      <div className="directory-header">
        <MainHeader
          title={directory.directoryName}
          icon={
            <img
              src={edit}
              alt="thirdIcon"
              className="header-icon"
              style={{ width: "32%", marginLeft: "7vw" }}
            />
          }
          path="/home"
          category={category}
          page={"디렉토리"}
        />
      </div>
      <div className="directory-main-content">
        <div className="directory-member-header">
          <MemberHeader memberList={memberList} id={id} />
        </div>
        <div className="directory-middle-container">
          <div
            className="directory-create-board"
            style={{ visibility: addBoard ? "hidden" : "visible" }}
            onClick={(e) => { e.stopPropagation(); nav(`/create-board/select-size`); }}
          >
            <span className="board-plus">퍼즐 추가</span>
            <img
              src={edit}
              alt="board-plus"
              className="board-plus-logo"
            />
          </div>
        </div>
        <div className="directory-slider">
          {boardList.length > 0 ? (
            <Slider {...settings}>
              {boardList.map((board, index) => (
                <div
                  key={index}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp(board.boardId)}
                >
                  <DirectoryCanvas boardSize={board.boardSize} thumbnailURL={board.thumbnailUrl} />
                  <div className="directory-board-name">
                    {directory.directoryName}#{board.boardName}
                  </div>
                </div>
              ))}
            </Slider>
          ) : null}
        </div>
      </div>

      <div className="directory-footer">
        <MainNav />
      </div>
    </div>
  );
};

export default Directory;
