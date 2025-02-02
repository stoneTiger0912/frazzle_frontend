import "./Loading.css";
import spinner from "../assets/img/spinner.gif";
import logo from "../assets/img/frazzle-logo.png";

const Loading = () => {
  return (
    <div className="background-loading">
      <img src={logo} alt="frazzle logo" />
      <img style={{ width: "10vw" }} src={spinner} alt="spinner" />
    </div>
  )
}

export default Loading;