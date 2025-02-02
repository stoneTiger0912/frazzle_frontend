import { useEffect } from "react";
import "./LoadingModal.css";
import { useNavigate } from "react-router-dom";
import spinner from "../assets/img/spinner.gif";

const LoadingModal = () => {

  return (
    <div className="loading-modal-frame absolute">
      <span>잠시만 기다려주세요</span>
      <img style={{ width: "10vw" }} src={spinner} alt="spinner" />
    </div>
  )
}

export default LoadingModal;