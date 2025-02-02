import { useNavigate } from "react-router-dom";
import "./MainNav.css";
import home from "../../assets/img/home.png";
import notification from "../../assets/img/notification.png";
import myPage from "../../assets/img/myPage.png"

const MainNav = () => {
  const nav = useNavigate();

  return (
    <div className="footer flex justify-content-center align-items-center">
      <div className="nav-item" onClick={() => nav("/notification")}>
        <div className="icon-container">
          <img
            src={notification}
            alt="Notification"
            className="icon"
          />
        </div>
        <div className="footer-element">알림</div>
      </div>
      <div className="nav-item" onClick={() => nav("/home")}>
        <div className="icon-container">
          <img
            src={home}
            alt="Home"
            className="icon"
          />
        </div>
        <div className="footer-element">홈</div>
      </div>
      <div className="nav-item" onClick={() => nav("/mypage")}>
        <div className="icon-container">
          <img
            src={myPage}
            alt="MyPage"
            className="icon"
          />
        </div>
        <div className="footer-element">마이페이지</div>
      </div>
    </div>
  );
};

export default MainNav;
