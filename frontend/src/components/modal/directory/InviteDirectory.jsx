import "./InviteDirectory.css";
import { useDispatch, useSelector } from "react-redux";
import { setModalId } from "../../../stores/directorySlice";
import { useEffect, useState, useRef } from "react";
import directoryApi from "../../../apis/directoryApi";

import InvitedMember from "./InvitedMember";
import { setMemberList } from "../../../stores/directorySlice";
import invite_member from "../../../assets/img/invite-member.png"
import x_symbol from "../../../assets/img/x-symbol.png";
import profile_default from "../../../assets/img/profile-default.png"

const InviteDirectory = () => {
  const dispatch = useDispatch();
  const directory = useSelector((state) => state.directory);
  const createBoard = useSelector((state) => state.createBoard);

  const [memberStateList, setMemberStateList] = useState([]);
  const [inputEmail, setInputEmail] = useState("");
  const [userList, setUserList] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [inviteMember, setInviteMember] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    setMemberStateList(directory.memberList);
  }, [directory.memberList]);

  useEffect(() => {
    if (!isFocused) {
      setUserList([]);
      return;
    }

    const fetchUsers = async () => {
      if (!inputEmail) return;
      try {
        const response = await directoryApi.get(
          `${createBoard.directoryId}/users/find?email=${inputEmail}`
        );

        const data = response.data.data.memberList;
        setUserList(data.length > 3 ? data.slice(0, 3) : data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    const interval = setInterval(() => {
      fetchUsers();
    }, 500);

    return () => clearInterval(interval);
  }, [inputEmail, isFocused, createBoard.directoryId]);

  const fetchInvitedMember = async () => {
    const data = {
      userId: inviteMember.userId,
    };
    try {
      const response = await directoryApi.post(
        `/${createBoard.directoryId}/user`,
        data
      );

      fetchDirectory();
      setInviteMember({});
    } catch (error) {
      console.error("Error fetching invited member:", error);
    }
  };

  const fetchDirectory = async () => {
    const response = await directoryApi.get(`/${createBoard.directoryId}`);
    const data = response.data.data;

    setMemberStateList(data.memberList);
  };

  useEffect(() => {
    dispatch(setMemberList(memberStateList));
  }, [memberStateList]);

  return (
    <div className="invite-directory-modal flex flex-wrap">
      <div className="invite-directory-modal-header flex">
        <img
          src={invite_member}
          alt="folder-icon"
          className="folder-icon"
        />
        <span className="create-directory-modal-title">디렉토리 멤버 초대</span>
        <img
          src={x_symbol}
          alt="x-symbol"
          className="x-symbol"
          onClick={() => dispatch(setModalId(0))}
        />
      </div>
      <div className="invite-directory-modal-body">
        <div className="email-input-container">
          <span className="email-text">초대하고 싶은 멤버의 이메일을 입력하세요</span>
          <div className="email-submit">
            {Object.keys(inviteMember).length === 0 &&
            memberStateList.length < 6 ? (
              <input
                className="email-input"
                type="email"
                ref={inputRef}
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() =>
                  setTimeout(() => {
                    setInputEmail("");
                    setIsFocused(false);
                  }, 200)
                }
              />
            ) : (
              <div className="invite-member-detail-container">
                {inviteMember.email ? (
                    <div className="invite-member-detail">
                      <div className="invite-member-detail-text">
                        <span className="invite-member-nickname">{inviteMember.nickname}</span>
                        <span className="invite-member-email">{inviteMember.email}</span>
                      </div>
                    <img
                      style={{ width: "6px", height: "6px", marginLeft: "2.5vw" }}
                        src={x_symbol}
                      alt=""
                      onClick={() => setInviteMember({})}
                    />
                  </div>
                ) :  <div className="invite-member-detail" style={{backgroundColor :" transparent"}}></div>}
              </div>
            )}
            <button className="email-button"
              disabled={
                (Object.keys(inviteMember).length === 0 &&
                  memberStateList.length < 6) ||
                memberStateList.length >= 6
              }
              onClick={fetchInvitedMember}
            >
              초대
            </button>
          </div>
          <div>
            {memberStateList.length === 6 ? (
              <span className="max-member">최대 6명만 가능합니다.</span>
            ) : null}
          </div>
        </div>
        {isFocused && userList.length !== 0 ? (
          <div className="user-list-container-before">
            {userList.map((user, index) => (
              <div
                key={index}
                className="user-item"
                onClick={() => {
                  setInviteMember(user);
                }}
              >
                <div
                  className="invited-member-circle-before"
                  style={{
                    backgroundImage: user.profileUrl
                      ? `url(${user.profileUrl})`
                      : `url(${profile_default})`
                  }}
                ></div>
                <div className="user-details">
                  <span className="user-nickname">{user.nickname}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {isFocused && userList.length == 0 ? (
          <div className="user-list-container-not">
            <div className="user-item">
              사용자가 존재하지 않습니다
            </div>
          </div>
        ) : null}
        <div className="members-container">
          {memberStateList.map((member, index) => (
            <InvitedMember key={index} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InviteDirectory;
