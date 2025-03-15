import React from "react";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";

function About() {
  const inputRef = useRef(null); //useRef 예제, 이 친구때문에 useEffect가 2번씩 렌더링 됨
  const focusInput = () => {
    inputRef.current.focus();
  };

  const [count, setCount] = useState(0); //useState 예제

  useEffect(() => {
    console.log("컴포넌트가 렌더링됨!");
  });

  return (
    <div>
      <h1>예제 해보기</h1>

      <input ref={inputRef} type="text" placeholder="입력하세요" />
      <button onClick={focusInput}>포커스</button>

      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>


    </div>
  );
}

export default About;