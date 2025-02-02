import "./MemberHeader.css";
import Profile from "../common/Profile";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setModalId } from "../../stores/directorySlice";
import { useDispatch } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import directoryApi from "../../apis/directoryApi";
import invite_member from "../../assets/img/invite-member.png"
import exit from "../../assets/img/exit.png"

// 3요소: 해당 페이지 이름, 해당 페이지 카테고리, 아이콘 (없을 수도 있음)
const MemberHeader = ({ memberList, id }) => {
  const dispatch = useDispatch();
  const nav = useNavigate();

  const [members, setMembers] = useState([]);
  const [memberAccept, setMemberAccept] = useState(0);

  useEffect(() => {
    if (memberList.length !== 0) setMembers(memberList);
    else setMembers([]);
  }, [memberList]);

  useEffect(() => {
    let temp = 0;
    for (let i = 0; i < members.length; i++) {
      if (members[i].accept) {
        temp++;
      }
    }
    setMemberAccept(temp);
  }, [members]);

  const openInviteModal = () => {
    dispatch(setModalId(1));
  };

  const openLeaveModal = () => {
    dispatch(setModalId(3));
  };

  return (
    <div className="member-header flex">
      <div className="member-header-left" onClick={openInviteModal}>
        <img
          src={invite_member}
          alt="invite-member"
          className="member-header-left-logo"
        />
        <span className="member-header-comment">멤버</span>
      </div>
      <div className="member-header-middle">
        {/* 멤버 스와이퍼 구현 */}
        {memberList.length > 4 ? (
          <Swiper
          spaceBetween={10}
          slidesPerView={Math.min(3.7, memberAccept)}
          centeredSlides={false}
            loop={false}
          >
          {members.map((member, index) =>
            member.accept ? (
              <SwiperSlide key={index}>
                <Profile
                  key={index}
                  imgUrl={member.profileUrl}
                  userName={member.nickname}
                />
              </SwiperSlide>
            ) : null
          )}
        </Swiper>
        ): (members.map((member, index) =>
          member.accept ? (
              <Profile
                key={index}
                imgUrl={member.profileUrl}
                userName={member.nickname}
              />
          ) : null
        ))}
        
      </div>

      <div className="member-header-right" onClick={openLeaveModal}>
        <img
          src={exit}
          alt="exit-directory"
          className="member-header-right-logo"
        />
        <span className="member-header-comment">탈퇴</span>
      </div>
    </div>
  );
};

export default MemberHeader;
