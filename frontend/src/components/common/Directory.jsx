import { useNavigate } from "react-router-dom";
import "./Directory.css";
import directory_folder from "../../assets/img/directory-folder.png"

const Directory = (props) => {
  let navigate = useNavigate();

  return (
    <div
      className="directory"
      onClick={() => {
        navigate(`/directories/${props.info.directoryId}`);
      }}
    >
      <div className="directory-icon">
        <img
          src={directory_folder}
          alt="directory-icon"
        ></img>
      </div>
      <div className="directory-category-box">
        <span className="directory-category">
          {/* category data binding */ props.info.category}
        </span>
      </div>
      <div className="directory-name-box">
        <span className="directory-name">
          {/* directory name data binding */ props.info.directoryName}
        </span>
      </div>
    </div>
  );
};

export default Directory;
