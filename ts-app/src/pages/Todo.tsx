import  { useRef } from "react";
import TodoInput from "../components/TodoInput";
import TodoList, { TodoListInstance } from "../components/TodoList";

function Todo() {
  const todoListRef = useRef<TodoListInstance>(null);

  const handleAddTodo = (text: string) => {
    todoListRef.current?.addTodo(text);
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