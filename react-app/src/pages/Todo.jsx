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