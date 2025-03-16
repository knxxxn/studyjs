import React, { useState } from "react";

interface TodoInputProps {
  onAddTodo: (text: string) => void;
}

function TodoInput({ onAddTodo }: TodoInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddTodo = () => {
    if (inputValue.trim() !== "") {
      onAddTodo(inputValue);
      setInputValue("");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="todo"
      />
      <button onClick={handleAddTodo}>추가</button>
    </div>
  );
}

export default TodoInput;
