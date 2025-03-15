import React, { useState, useImperativeHandle, forwardRef } from 'react';
import TodoItem from './TodoItem';

const TodoList = forwardRef((props, ref) => {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    setTodos([...todos, {
      id: Date.now(),
      text: text,
      completed: false
    }]);
  };

  useImperativeHandle(ref, () => ({
    addTodo: addTodo
  }));

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <ul>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
});

export default TodoList;