import React, { useEffect } from "react";
import "./KakaoLoginButton.css";
import kakao_logo from "../../assets/img/kakao-logo.png"

const KakaoLoginButton = () => {

  const loginWithKakao = () => {

    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_REST_API_KEY}&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}&response_type=code`;
    // 카카오 로그인 화면 이동
    window.location.href = kakaoURL;
  };

  return (
    <div className="kakao-button flex align-items-center" onClick={ loginWithKakao }>
      <img src={ kakao_logo} alt="kakao-logo" />
      <span>카카오톡으로 로그인</span>
    </div>
  );
};

export default KakaoLoginButton;
