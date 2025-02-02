import React, { useEffect, useState } from "react";
import { store } from "./../stores/store"; // Redux 스토어 직접 가져오기
import socketApi from "../apis/socketApi";
import MainHeader from "../components/common/MainHeader";
import GameWaitingRoomHeader from "../components/common/GameWaitingRoomHeader";
import ChatBoard from "../components/common/ChatBoard";
import MainNav from "../components/common/MainNav";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./WaitingRoom.css";
import { setGameUser, setGameInfo } from "../stores/waitingRoomSlice";
import { cropImageToSquare } from "../utils/cropImage";
import LoadingModal from "./LoadingModal";
import edit_image from "../assets/img/edit-image.png"

const WaitingRoom = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [robyData, setRobyData] = useState(null);
  const [timer, setTimer] = useState(-1);
  const [gameStart, setGameStart] = useState(false);
  const [robyKing, setRobyKing] = useState("");
  const [robyUserList, setRobyUserList] = useState([]);
  const [activateButton, setActivateButton] = useState(false);
  const [showGameImg, setShowGameImg] = useState(false);

  const [cropGameImg, setCropImage] = useState(null);
  const [isCropped, setCropFlag] = useState(false);
  const [loading, setLoading] = useState(false);

  const { connectSocket, sendMessage, disconnectSocket } = socketApi;
  const nav = useNavigate();
  const dispatch = useDispatch();

  const state = store.getState(); // Redux 상태 직접 가져오기
  const waitingRoom = state.waitingRoom;
  const user = state.user;
  const { roomID } = useParams();

  // socket 연결
  useEffect(() => {
    setLoading(true);
    connectSocket(
      () => setIsConnected(true), // 연결 확인
      (
        receivedMessage // 메시지
      ) => setMessages((prevMessage) => [...prevMessage, receivedMessage]),
      (robyData) => setRobyData(robyData), // 게임 대기 방 정보
      (timerData) => setTimer(timerData), // 게임 대기 방 timer
      () => setGameStart(true),
      (gameInfo) => dispatch(setGameInfo(gameInfo)), // 게임 정보 받기
      null, // 게임 방 timer
      null, // 게임 종료
      null, // 게임 참여 유저 
      roomID // 방 번호
    );

    return () => {
      exitRoom();
      disconnectSocket();
      setIsConnected(false);
    };
  }, [roomID]);

  // 게임 시작 시 게임 룸으로 이동
  useEffect(() => {
    if (gameStart) {

      nav(`/game-room/${roomID}`, { state: { cropGameImg } });
    }
  }, [gameStart, roomID, nav, cropGameImg]);

  // 소켓 연결 후 방 입장
  useEffect(() => {
    if (isConnected) {
      joinRoom();
      setLoading(false);
    }
  }, [isConnected, roomID]);

  const joinRoom = () => {
    const data = {
      boardId: roomID,
      userId: 0,
      size: waitingRoom.level,
      message: `${user.nickName}이 입장하였습니다.`,
    };

    sendMessage(`/pub/roby/entry/${roomID}`, data);
  };

  const exitRoom = () => {
    const data = {
      boardId: roomID,
      userId: 0,
      message: `${user.nickName}이 퇴장하셨습니다.`,
    };

    sendMessage(`/pub/roby/exit/${roomID}`, data);
  };

  // Roby 데이터에 대한 처리
  useEffect(() => {
    if (robyData) {
      setRobyKing(robyData.king);
      setRobyUserList(robyData.robyUserList);
      setActivateButton(
        robyData.maxPeople / 2 <= robyData.robyUserList.length &&
        robyData.king.nickname === user.nickName
      );

      dispatch(setGameUser(robyData.robyUserList));

      //불러온 로비데이터의 이미지 크롭
      cropImageToSquare(robyData?.imgUrl, (croppedImageUrl, err) => {
        if (err) {
          console.error("크롭 이미지 생성 실패", err);
          setCropImage(robyData?.imgUrl);
          return;
        }
        console.log("크롭 이미지 생성 성공");
        setCropImage(croppedImageUrl);
        setCropFlag(true);
      });
    }
  }, [robyData, user.nickName]);

  const handleInputMessage = (event) => {
    setInputMessage(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendInputMessage();
    }
  };

  const sendInputMessage = () => {
    if (inputMessage.trim() === "") return;

    const data = {
      boardId: roomID,
      userId: 0,
      nickname: user.nickName,
      message: inputMessage,
    };

    sendMessage(`/pub/message/${roomID}`, data);
    setInputMessage("");
  };

  // 타이머 종료 시 처리
  useEffect(() => {
    if (timer === 0) {
      nav(`/boards/${roomID}`);
    }
  }, [timer, nav, roomID]);

  const moveGameRoom = () => {
    const data = {
      boardId: roomID,
      start: true,
      size: waitingRoom.level,
    };

    sendMessage(`/pub/start/${roomID}`, data);
  };

  return (
    <div className="w-full h-full flex flex-wrap relative">
      {loading ? <LoadingModal /> : null}
      <div className="waiting-room-header">
        <MainHeader
          title={"PUZZLE"}
          directoryName={waitingRoom.directoryName}
        />
      </div>
      <div className="waiting-room-participation">
        <GameWaitingRoomHeader
          robyKing={robyKing}
          robyUserList={robyUserList}
        />
      </div>

      <div className="waiting-room-body">
        {showGameImg ? (
          <img
            className="show-waiting-room-game-img"
            src={cropGameImg || ""}
            alt="show-img"
          />
        ) : (
          <ChatBoard messages={messages} />
        )}

        <div className="chat-input-container">
          <input
            className="chat-input"
            type="text"
            value={inputMessage}
            onChange={handleInputMessage}
            onKeyDown={handleKeyDown}
            onClick={() => setShowGameImg(false)}
            placeholder="내용을 입력해주세요"
          />
          <button className="chat-input-button" onClick={sendInputMessage} />
        </div>
      </div>
      <div className="enter-game-room-container">
        <button
          className="enter-game-room-button"
          disabled={!activateButton}
          onClick={moveGameRoom}
        >
          {activateButton
            ? `준비 완료 (${timer}초 후에 방이 폭파됩니다.)`
            : `${timer}초 후에 방이 폭파됩니다.`}
        </button>
        <div
          className="show-game-img"
          onClick={() => setShowGameImg(!showGameImg)}
        >
          <img
            src={edit_image}
            alt="show-img"
          />
        </div>
      </div>
      <div className="waiting-room-footer">
        <MainNav />
      </div>
    </div>
  );
};

export default WaitingRoom;
