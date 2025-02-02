import { react, useState, useEffect } from "react";
import "./EnterWaitingRoom.css";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import boardApi from "../../../apis/boardApi";
import {
  setGameImgUrl,
  setdirectoryName,
} from "../../../stores/waitingRoomSlice";
import { setModalBoardId } from "../../../stores/boardSlice";
import x_symbol from "../../../assets/img/x-symbol.png";

const EnterWaitingRoom = () => {
  const waitingRoom = useSelector((state) => state.waitingRoom);
  const board = useSelector((state) => state.board);

  const dispatch = useDispatch();
  const nav = useNavigate();

  useEffect(() => {
    const fetchGetGameImage = async () => {
      const response = await boardApi.get(`/${waitingRoom.boardId}/games`);
      const data = response.data.data;

      dispatch(setGameImgUrl(data.imgUrl));
      dispatch(setdirectoryName(data.directoryName));

    };

    fetchGetGameImage();

  }, []);

  return (
    <>
      <div className="enter-waiting-modal">
        <div className="enter-waiting-modal-header flex">
          <img
            src={x_symbol}
            alt="x-symbol"
            className="x-symbol"
            onClick={() => dispatch(setModalBoardId(0))}
          />
        </div>
        <div className="enter-waiting-modal-body">
          <img
            className="waiting-room-img"
            src={waitingRoom.gameImgUrl}
            alt=""
          />
          <div className="game-info">
            <span className="game-title">
              [{waitingRoom.directoryName}] 퍼즐 게임
            </span>

            <div className="game-info-detail">카테고리: {board.category}</div>
            <div className="game-info-detail">
              키워드:
              <div className="game-info-keywords">
                {board.keywords.length > 0
                  ? board.keywords.map((keyword, index) => (
                      <div key={index} className="game-info-keyword">
                        #{keyword}
                      </div>
                    ))
                  : null}
              </div>
            </div>
            <div className="game-info-detail">난이도:{waitingRoom.level}</div>
          </div>
          <div className="enter-waiting-room-note">
            <span className="enter-note-title">유의 사항</span>
            <span className="enter-note-content">
              {`· 과반수 이상이 참여해야 게임 시작 버튼이 활성화됩니다.
  · 게임 방 생성 후 5분 내로 시작하지 않으면 게임 방은 종료됩니다.
  · 퍼즐은 퍼즐 판당 1회 완성할 수 있습니다.`}
            </span>
          </div>
        </div>
        <div
          className="enter-waiting-room-buttom"
          onClick={() => nav(`/waiting-room/${waitingRoom.boardId}`)}
        >
          게임 방 참여하기
        </div>
      </div>
    </>
  );
};

export default EnterWaitingRoom;
