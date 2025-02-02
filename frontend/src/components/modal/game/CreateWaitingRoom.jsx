import React, { useEffect, useState } from "react";
import "./CreateWaitingRoom.css";
import boardApi from "../../../apis/boardApi";
import { useDispatch, useSelector } from "react-redux";
import {
  setGameImgUrl,
  setdirectoryName,
  setGameLevel,
} from "../../../stores/waitingRoomSlice";
import { useNavigate } from "react-router-dom";
import { setModalId } from "../../../stores/boardSlice";
import x_symbol from "../../../assets/img/x-symbol.png";

const CreateWaitingRoom = () => {
  const waitingRoom = useSelector((state) => state.waitingRoom);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const levelConfig = [0, 4, 6, 8];

  const [level, setLevel] = useState(0);

  useEffect(() => {
    const fetchGetGameImage = async () => {
      const response = await boardApi.get(`/${waitingRoom.boardId}/games`);
      const data = response.data.data;

      dispatch(setGameImgUrl(data.imgUrl));
      dispatch(setdirectoryName(data.directoryName));
    };

    fetchGetGameImage();
  }, []);

  const moveWaitingRoom = () => {
    if (level === 0) return;

    dispatch(setGameLevel(levelConfig[level]));
    nav(`/waiting-room/${waitingRoom.boardId}`);
  };

  const checkWaitingRoom = async () => {
    const fetchcheckGameRoom = async () => {
      const response = await boardApi.get(`/${waitingRoom.boardId}/rooms`);
      const data = response.data.data;

      if (data.exist) {
        dispatch(setModalId(0));
        alert("게임 대기 방이 존재합니다");
      } else {
        moveWaitingRoom();
      }
    };

    fetchcheckGameRoom();
  };

  return (
    <>
      <div className="create-waiting-modal">
        <div className="create-waiting-modal-header flex">
          <img
            src={x_symbol}
            alt="x-symbol"
            className="x-symbol"
            onClick={() => dispatch(setModalId(0))}
          />
        </div>
        <div className="create-waiting-modal-body">
          <img
            className="waiting-room-img"
            src={waitingRoom.gameImgUrl}
            alt=""
          />
          <div className="set-game-level-container">
            <span className="level-text">Level</span>
            <div className="select-levels">
              <button
                onClick={() => setLevel(1)}
                className={level !== 1 ? "select-level" : "selected-level"}
              >
                <b>easy</b>
                <br />
                4X4
              </button>
              <button
                onClick={() => setLevel(2)}
                className={level !== 2 ? "select-level" : "selected-level"}
              >
                <b>normal</b>
                <br />
                6X6
              </button>
              <button
                onClick={() => setLevel(3)}
                className={level !== 3 ? "select-level" : "selected-level"}
              >
                <b>hard</b>
                <br />
                8X8
              </button>
            </div>
          </div>
          <div className="waiting-room-note">
            <span className="note-title">유의 사항</span>
            <span className="note-content">
              {`· 과반수 이상이 참여해야 게임 시작 버튼이 활성화됩니다.
  · 게임 방 생성 후 5분 내로 시작하지 않으면 게임 방은 종료됩니다.
  · 퍼즐은 퍼즐 판당 1회 완성할 수 있습니다.`}
            </span>
          </div>
        </div>
        <div
          className={
            level === 0 ? "create-room-button" : "create-room-button-not"
          }
          onClick={checkWaitingRoom}
        >
          게임 방 만들기
        </div>
      </div>
    </>
  );
};

export default CreateWaitingRoom;
