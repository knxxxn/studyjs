import React, { useState, useImperativeHandle, forwardRef } from 'react';
import TodoItem from './TodoItem';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface TodoListInstance {
  addTodo: (text: string) => void;
}

const TodoList = forwardRef<TodoListInstance>((_, ref) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    setTodos((prevTodos) => [ //setTodos를 사용하여 상태를 업데이트
      ...prevTodos,
      { id: Date.now(), text, completed: false },
    ]);
  };

  useImperativeHandle(ref, () => ({ //useImperativeHandle 사용하여 부모 컴포넌트에서 ref를 통해 addTodo 함수를 호출
    addTodo,
  }));

  const toggleTodo = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
        />
      ))}
    </ul>
  );
});

export default TodoList;