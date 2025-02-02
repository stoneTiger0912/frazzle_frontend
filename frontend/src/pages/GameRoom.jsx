import React, { useState, useEffect, useRef } from "react";
import "./GameRoom.css";
import { useParams, useLocation } from "react-router-dom";
import GameBoard from "../components/game/GameBoard";
import socketApi from "../apis/socketApi";
import MainHeader from "../components/common/MainHeader";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ChatBoard from "../components/common/ChatBoard";
import GameModalFrame from "./modalFrame/GameModalFrame";
import { detectVoice } from "../components/gameTalk/detectVoice";
import { OpenVidu } from "openvidu-browser";
import gameOpenViduApi from "../apis/gameOpenViduApi";
import GameRoomMemberComponent from "../components/gameTalk/GameRoomMemberComponent";
import AudioDeviceSelector from "../components/gameTalk/AudioDeviceSelector";
import LoadingModal from "./LoadingModal";
import voice_talk from "../assets/img/voice-talk.png"
import voice from "../assets/img/voice.png"
import voice_off from "../assets/img/voice-off.png"
import chat from "../assets/img/chat.png"
import picture from "../assets/img/picture.png"
const GameRoom = () => {
  const { roomID } = useParams();
  const user = useSelector((state) => state.user);
  const waitingRoom = useSelector((state) => state.waitingRoom);

  const location = useLocation();
  const gameImg = location.state?.cropGameImg;

  const nav = useNavigate();
  const directoryId = useSelector((state) => state.createBoard.directoryId);

  const {
    connectSocket,
    sendMessage,
    disconnectSocket,
    exitGameRoom,
    exitRobyRoom,
  } = socketApi;

  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [timer, setTimer] = useState(-1); // 화면에 표시할 timer 상태
  const [showWindow, setShowWindow] = useState(0);
  const [winner, setWinner] = useState({});
  const [gameUsers, setGameUsers] = useState([]);

  const timerRef = useRef(timer); // 최신 timer 값을 추적하기 위한 ref

  // openvidu
  const publisher = useRef(null);
  const nickname = useSelector((state) => state.user.nickName);
  const profileImg = useSelector((state) => state.user.profileImg);
  const [sessionId, setSessionId] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [myUserName, setMyUserName] = useState(nickname);
  const [myProfileUrl, setMyProfileUrl] = useState(profileImg);

  const sessionRef = useRef(null);

  const [users, setUsers] = useState([]);
  const usersRef = useRef(users); // users 상태를 추적하기 위한 usersRef

  // 내 오디오 장치
  const [selectedAudio, setSelectedAudio] = useState(null);

  // 음소거 설정 초기값 true
  const [isUnMuted, setIsUnMuted] = useState(true);

  // joinSession 중인지 확인하는 상태 초기값 false
  const [isJoining, setIsJoining] = useState(false);

  // 브라우저 탭을 닫거나, 페이지를 새로 고침하거나, 앱을 종료할 때 leaveSession()을 호출하여 명시적으로 세션
  // useEffect(() => {
  //   const onbeforeunload = () => {
  //     leaveSession();
  //   };

  //   // 웹 페이지를 떠나기 전 세션 leave를 먼저 진행시키기 위해 사용
  //   window.addEventListener("beforeunload", onbeforeunload);

  //   return () => {
  //     window.removeEventListener("beforeunload", onbeforeunload);
  //   };
  // }, []);

  useEffect(() => {
    // audio 활성화를 위한 useEffect 함수
    if (publisher.current) {
      publisher.current.publishAudio(isUnMuted);
    }
  }, [isUnMuted]);

  const fetchTalkData = async () => {
    try {
      const requestData = { boardId: roomID };
      const response = await gameOpenViduApi.post("", requestData);
      const { sessionId, tokenId } = response.data.data;
      setSessionId(sessionId);
      setTokenId(tokenId);
      return { sessionId, tokenId };
    } catch (error) {
      console.error("Error fetching session and token:", error);
    }
  };

  const joinSession = async (sessionId, tokenId) => {
    if (!sessionId || !tokenId) {
      console.error("No sessionId or token available");
      return;
    }

    try {
      const OV = new OpenVidu();
      const mySession = OV.initSession();

      // 상대방 음성 감지 상태 수신 설정
      mySession.on("signal:isSpeaking", (event) => {
        const { userId, isSpeaking } = JSON.parse(event.data);
        setUsers((users) =>
          users.map((user) =>
            user.id === userId ? { ...user, isSpeaking } : user
          )
        );
      });

      mySession.on("streamCreated", (event) => {
        const connectionData = JSON.parse(event.stream.connection.data);
        const { nickname, profileImg } = connectionData.clientData; // 각각 client에 대한 정보

        // subscriber를 이용해서 진행
        // 스트림을 구독하여 streamManager를 얻습니다.
        const subscriber = mySession.subscribe(event.stream, undefined);
        setUsers((users) => [
          ...users,
          {
            id: event.stream.connection.connectionId,
            name: nickname,
            isSpeaking: false,
            profileUrl: profileImg,
            streamManager: subscriber, // streamManager를 추가하여 OpenViduAudiocomponent에 전달
          },
        ]);
      });

      mySession.on("streamDestroyed", (event) => {
        setUsers((users) =>
          users.filter((user) => user.id !== event.stream.streamId)
        );
      });

      mySession.on("exception", (exception) => {
        console.warn(exception);
      });

      await mySession.connect(tokenId, {
        clientData: { nickname: myUserName, profileImg: myProfileUrl },
      });

      const publisherOV = await OV.initPublisherAsync(undefined, {
        audioSource: selectedAudio || undefined, // 유효한 오디오 소스가 없으면 undefined 사용, 디바이스 내 감지된 마이크로 설정 가능
        videoSource: false,
        publishAudio: isUnMuted,
        publishVideo: false,
        insertMode: "APPEND",
        mirror: false,
      });
      mySession.publish(publisherOV);
      publisher.current = publisherOV;

      sessionRef.current = mySession;

      // 현재 사용자 정보를 users 배열에 추가
      setUsers((users) => [
        ...users,
        {
          id: publisherOV.stream.connection.connectionId,
          name: nickname,
          profileUrl: profileImg,
          isSpeaking: false,
          streamManager: undefined,
        },
      ]);

      // ov 설정 후 마지막에 detectvoice 추가
      detectVoice(publisherOV, mySession, setUsers, usersRef);
    } catch (error) {
      console.log(
        "There was an error connecting to the session:",
        error.code,
        error.message
      );
    }
  };

  const leaveSession = async () => {
    if (sessionRef.current) {
      await sessionRef.current.disconnect();
    }

    sessionRef.current = null;
    setUsers([]);
    setIsJoining(false);
  };

  const toggleMute = () => {
    setIsUnMuted(!isUnMuted);
  };

  const handleJoinClick = async () => {
    if (isJoining) return; // 이미 joinSession 중이면 아무 동작도 하지 않음
    setIsJoining(true); // joinSession 중으로 설정
    const { sessionId, tokenId } = await fetchTalkData();
    if (sessionId && tokenId) {
      joinSession(sessionId, tokenId);
    } else {
      console.error(
        "No sessionId or token available when trying to join session"
      );
    }
  };

  //게임 소켓 연결
  useEffect(() => {
    setLoading(true);
    connectSocket(
      () => setIsConnected(true), // 연결 확인
      (
        receivedMessage // 메시지
      ) => setMessages((prevMessage) => [...prevMessage, receivedMessage]),
      null, //게임 대기 방 정보
      null, // 게임 대기 방 timer
      null, // 게임 시작 확인
      null, // 게임 정보 받아오기
      (timerData) => {
        setTimer(timerData); // 화면에 표시할 timer 업데이트
        timerRef.current = timerData; // ref에도 최신값 저장
      }, // 게임 방 timer
      (endGameData) => setWinner(endGameData), // 게임 완료
      (userInfo) => setGameUsers(userInfo), // 게임 참여 유저 정보
      roomID // 방 번호
    );

    return () => {
      leaveSession();
      exitRoom();
      exitGame();
      disconnectSocket();
      setIsConnected(false);
    };
  }, [roomID, connectSocket, disconnectSocket]);

  useEffect(() => {
    if (isConnected) {
      joinGame();
      joinRoom();
      setLoading(false);
    }
    //소켓 연결 후 게임 시작되게 하기
  }, [isConnected]);

  useEffect(() => {
    if (Object.keys(winner).length === 0) return;

    // 5초 후 완료된 퍼즐판 화면으로 이동
    setTimeout(() => {
      setWinner({});
      nav(`/boards/${roomID}`);
    }, 5000);
  }, [winner, nav, roomID]);

  const joinGame = () => {
    sendMessage(`/pub/game/entry/${roomID}`);
  };

  const joinRoom = () => {
    const data = {
      boardId: roomID,
      userId: 0,
      message: `${user.nickName}이 입장하였습니다.`,
    };

    sendMessage(`/pub/roby/entry/${roomID}`, data);
  };

  const exitRoom = () => {
    const data = {
      boardId: roomID,
      userId: 0,
      nickName: user.nickName,
      message: `${user.nickName}이 퇴장하셨습니다.`,
    };

    exitRobyRoom(`/pub/roby/exit/${roomID}`, data);
  };

  const exitGame = () => {
    exitGameRoom(`/pub/exit/puzzle/${roomID}`);
  };

  const sendEndGame = () => {
    const data = {
      time: timerRef.current, // 최신 timer 값을 사용
    };
    sendMessage(`/pub/end/puzzle/${roomID}`, data);
  };

  const showWindowImg = () => {
    if (showWindow !== 2) setShowWindow(2);
    else setShowWindow(0);
  };

  const showWindowChat = () => {
    if (showWindow !== 1) setShowWindow(1);
    else setShowWindow(0);
  };

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

  return (
    <div className="w-full h-full relative">
      {loading ? <LoadingModal /> : null}
      {Object.keys(winner).length !== 0 ? (
        <GameModalFrame winner={winner} />
      ) : null}
      <div className="game-room-header">
        <MainHeader
          title="PUZZLE"
          timer={timer}
          path={`/directories/${directoryId}`}
        />
      </div>
      <div className="game-room-participations">
        <GameRoomMemberComponent rtcUsers={users} gameUsers={gameUsers} />
      </div>
      <div className="game-room-game-board">
        <div className={showWindow === 0 ? "visible" : "hidden"}>
          <GameBoard id={roomID} gameImg={gameImg} sendEndGame={sendEndGame} />
        </div>

        {showWindow === 1 ? (
          <>
            <ChatBoard messages={messages} />
            <div className="game-chat-input-container">
              <input
                className="game-chat-input"
                type="text"
                value={inputMessage}
                onChange={handleInputMessage}
                onKeyDown={handleKeyDown}
                placeholder="내용을 입력해주세요"
              />
              <button
                className="game-chat-input-button"
                onClick={sendInputMessage}
              />
            </div>
          </>
        ) : null}
        {showWindow === 2 ? (
          <img
            className="show-waiting-room-game-img"
            src={gameImg}
            alt="show-img"
          />
        ) : null}
      </div>

      <div className="game-room-footer">
        <div className="game-room-footer-button">
          <img
            src={voice_talk}
            alt="show-img"
            onClick={handleJoinClick}
          />
        </div>
        <div className="game-room-footer-button">
          <img
            src={
              isUnMuted
                ? {voice}
                : {voice_off}
            }
            alt="show-img"
            onClick={toggleMute}
          />
        </div>
        <div className="game-room-footer-button">
          <img
            src={chat}
            alt="game-chat"
            onClick={showWindowChat}
          />
        </div>
        <div className="game-room-footer-button">
          <img
            src={picture}
            alt="show-img"
            onClick={showWindowImg}
          />
        </div>
      </div>
      <div className="hidden-audio-selector">
        <AudioDeviceSelector
          selectedAudio={selectedAudio}
          setSelectedAudio={setSelectedAudio}
        />
      </div>
    </div>
  );
};

export default GameRoom;
