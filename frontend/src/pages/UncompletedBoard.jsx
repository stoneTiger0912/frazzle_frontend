import { useEffect, useState } from "react";
import "./UncompletedBoard.css";
import { useDispatch, useSelector } from "react-redux";
import boardApi from "../apis/boardApi";
import {
  setBoardCategory,
  setBoardKeywords,
  setVote,
} from "../stores/boardSlice";
import { setModalId } from "../stores/boardSlice";
import LoadingModal from "./LoadingModal";
import BoardModalFrame from "./modalFrame/BoardModalFrame";
import MainHeader from "../components/common/MainHeader";
import PuzzleCanvas from "../components/puzzleBoard/PuzzleCanvas";
import { setBoardId } from "../stores/waitingRoomSlice";
import MainNav from "../components/common/MainNav";
import { setGameLevel } from "../stores/waitingRoomSlice";
import trash from "../assets/img/trash.png"

const UncompletedBoard = ({ boardID }) => {
  // 모달 창
  const [boardName, setBoardName] = useState("");
  const [category, setCategory] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [boardSize, setBoardSize] = useState(0);
  const [pieceId, setPieceId] = useState(0);
  const [pieceData, setPieceData] = useState([]);
  const [activateGameRoom, setActivateGameRoom] = useState(0);
  const [createRoom, setCreateRoom] = useState(false);
  const [existGame, setExistRoom] = useState(false);

  const dispatch = useDispatch();

  const piece = useSelector((state) => state.piece);
  const board = useSelector((state) => state.board);
  let directoryId = useSelector((state) => state.createBoard.directoryId);
  let imgLoading = useSelector((state) => state.loading.imgLoading);

  useEffect(() => {
    const fetchPuzzleData = async () => {
      const response = await boardApi.get(`/${boardID}`);

      const data = response.data.data;

      // 퍼즐판 정보 세팅
      setBoardName(data.directoryName + "#" + data.boardNum);
      setCategory(data.category);
      dispatch(setBoardCategory(data.category));
      if (data.keyword) {
        setKeywords(data.keyword);
        dispatch(setBoardKeywords(data.keyword));
      }

      setBoardSize(data.boardSize);
      setPieceId(data.pieceList[0].pieceId);
      setPieceData(data.pieceList);
      setActivateGameRoom(data.boardClearType);

      dispatch(setVote(data.voteStatus));
    };

    const fetchCreateGameRoom = async () => {
      const response = await boardApi.get(`/${boardID}/rooms`);
      const data = response.data.data;


      setCreateRoom(data.exist);
      dispatch(setGameLevel(data.size));
    };

    fetchPuzzleData();
    fetchCreateGameRoom();
  }, [piece.pieceId, board.modalId]);

  useEffect(() => {
    if (activateGameRoom === 0) {
      // 게임 방 생성 안 됨
      return;
    }

    const fetchExistGameRoom = async () => {
      const response = await boardApi.get(`${boardID}/games/in-game`);
      setExistRoom(response.data.data.exist);
    };

    fetchExistGameRoom();
  }, [activateGameRoom]);

  useEffect(() => {
    // 퍼즐 조각 클릭 여부 조회 후 모달 창 생성 혹은 삭제
    if (piece.pieceId !== 0) {
      // DB에서 정보 불러오는 시간
      setTimeout(() => {
        dispatch(setModalId(1));
      }, 500);
    } else {
      dispatch(setModalId(0));
    }
  }, [piece.pieceId]);

  const checkWaitingRoom = async () => {
    const fetchcheckGameRoom = async () => {
      const response = await boardApi.get(`/${boardID}/rooms`);
      const data = response.data.data;

      setCreateRoom(data.exist);
      dispatch(setGameLevel(data.size));

      dispatch(setBoardId(boardID));
      if (data.exist) {
        dispatch(setModalId(3));
      } else {
        dispatch(setModalId(2));
      }
    };

    fetchcheckGameRoom();
  };

  return (
    <div className="w-full h-full flex flex-wrap relative">
      {imgLoading ? <LoadingModal /> : null}
      {board.modalId !== 0 ? <BoardModalFrame /> : null}
      <div className="board-header">
        <MainHeader
          title={boardName}
          icon={
            !board.vote && (
              <img
                src={trash}
                alt="thirdIcon"
                className="header-icon"
                style={{ width: "40%", marginLeft: "7vw" }}
              />
            )
          }
          path={`/directories/${directoryId}`}
          category={category}
          page="퍼즐판"
          boardID={boardID}
        />
      </div>
      <div className="board-main-content">
        <div className="board-keywords">
          {keywords.map((keyword, index) => (
            <div key={index} className="board-keyword">
              #{keyword}
            </div>
          ))}
        </div>
        <PuzzleCanvas
          boardSize={boardSize}
          pieceId={pieceId}
          pieceData={pieceData}
        />
        <div className="game-room-container">
          {/* 대기 방이 생성되어 있지 않은 경우 */}
          {/* 대기 방 생성 조건에 맞지 않을 경우 */}
          {!createRoom && !existGame ? (
            <button
              className="game-room-button"
              disabled={activateGameRoom === 0}
              onClick={checkWaitingRoom}
            >
              게임 방 만들기
            </button>
          ) : null}
          {/* 대기 방이 생성되어 있지만 게임이 시작되지 않은 경우 */}
          {/* 게임이 시작된 경우*/}
          {createRoom && !existGame ? (
            <button
              className="game-room-button"
              onClick={() => {
                dispatch(setBoardId(boardID));
                dispatch(setModalId(3));
              }}
            >
              게임 방 참여하기
            </button>
          ) : null}
          {existGame ? (
            <button className="game-room-button" disabled>
              게임이 이미 시작되었습니다.
            </button>
          ) : null}
        </div>
      </div>

      <div className="board-footer">
        <MainNav />
      </div>
    </div>
  );
};

export default UncompletedBoard;
