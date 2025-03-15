// 투두 리스트 만들기 - hook 사용
// 1. 경로는 /todo
// 2. todo 객체는 아래 형식
// {
// id: date(현재 날짜),
// text: string,
// completed: boolean
// }
// 3. todo 추가, 완료, 삭제 기능
// 추가 시 todo 추가
// 완료 시 todo text의 css 변경, 버튼 변경(임의로)
// 삭제 시 todo 삭제

import React, { useRef } from 'react';
import TodoInput from '../components/TodoInput';
import TodoList from '../components/TodoList';
//useRef = 컴포넌트의 상태를 변경하지 않고 값 유지 또는 dom요소 직접 접근을 위해 사용하는 hook

function Todo() {
  const todoListRef = useRef(null);

  const handleAddTodo = (text) => {
    if (todoListRef.current && todoListRef.current.addTodo) {
      todoListRef.current.addTodo(text);
    }
  };

  return (
    <div>
      <h1>투두</h1>
      <TodoInput onAddTodo={handleAddTodo} />
      <TodoList ref={todoListRef} />
    </div>
  );
}

export default Todo;