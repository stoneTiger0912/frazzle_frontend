import "./KeywordPill.css";
import x_symbol from "../../assets/img/x-symbol.png";

const KeywordPill = (props) => {
  return (
    <div className="keyword-pill flex" onClick={(e) => {
      // keyword 저장 공간을 클릭한 요소 삭제한 것으로 업데이트
      let deepcopy = [...props.keyword];
      deepcopy = deepcopy.filter(element => element !== props.info);
      props.setKeyword(deepcopy);
      // Event Bubbling 예방
      e.stopPropagation();
    }}>
      <span id="keyword-pill-content">#{props.info}</span>
      <div className="x-icon-container">
        <img src={x_symbol} alt="x-icon" />
      </div>
    </div>
  )
}

export default KeywordPill;