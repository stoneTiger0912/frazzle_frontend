import { useState } from "react";
import "./Mission.css";
import { useDispatch } from "react-redux";
import { setGptLoading } from "../../stores/loadingSlice";
import reload from "../../assets/img/reload.png"

const Mission = ({ info, postGuides, keywordList, prevMissions, directoryId, setMissions, missions, setPrevMissions, reloadActive, setCanReload, canReload }) => {

  let dispatch = useDispatch();

  return (
    <div className="mission flex">
      <span>{info}</span>
      {
        reloadActive ? <img src={reload} alt="reload-icon" onClick={(e) => {
          // 1. 이벤트 버블링 방지
          e.stopPropagation();
          // 2. num 인자를 1로 고정한 axios POST 요청 (Cannot use keyword 'await' outside an async function)
          const asyncPostGuides = async (keywordList, prevMissions, directoryId) => {
            dispatch(setGptLoading(true));
            const guideList = await postGuides(keywordList, 1, prevMissions, directoryId);
            // guideList[0]이 실제 미션 문자열  // missions에서는 기존의 응답을 교체하기
            let newArr = missions.map(item => item === info ? guideList[0] : item);
            setMissions(newArr);
            // prevMissions에서는 새로운 응답을 뒤에 추가하기
            let deepcopy = [...prevMissions];
            deepcopy.push(guideList[0]);
            setPrevMissions(deepcopy);
            // 남은 리로드 횟수 반영
            let remain = canReload - 1;
            setCanReload(remain);
            dispatch(setGptLoading(false));
          }
          asyncPostGuides(keywordList, prevMissions, directoryId);
        }} /> : null
      }
    </div>
  )
}

export default Mission;