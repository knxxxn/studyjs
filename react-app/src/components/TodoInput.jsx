import React, { useState } from 'react';
//useState = 컴포넌트의 상태를 관리하는 hook

function TodoInput({onAddTodo}) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddTodo = () => {
    if (inputValue.trim() !== '') {
        onAddTodo(inputValue);
        setInputValue('');
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