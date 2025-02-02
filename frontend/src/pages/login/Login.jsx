import "./Login.css";
import React from "react";
import KakaoLoginButton from "../../components/login/KakaoLoginButton";
import GoogleLoginButton from "../../components/login/GoogleLoginButton";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import logo from "../../assets/img/frazzle-puzzle.png";

const Login = () => {
  const user = useSelector((state) => state.user);
  const nav = useNavigate();

  useEffect(() => {
    if (user.accessToken !== "") {
      nav("/home");
    }
  });
  
  return (
    <div className="w-full h-full">
      <div className="main-content">
        <img
          src={logo}
          alt="frazzle-puzzle"
        />
        <span className="oneline">
          <span className="bold">퍼즐 조각</span>에
        </span>
        <span className="oneline">
          <span className="bold">추억</span>을 저장해 보세요.
        </span>
      </div>
      <div className="button-content">
        <KakaoLoginButton />
        <GoogleLoginButton />
      </div>
    </div>
  );
};

export default Login;
