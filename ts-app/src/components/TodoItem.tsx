interface TodoItemProps {
  todo: {
    id: number;
    text: string;
    completed: boolean;
  }; 
  toggleTodo: (id: number) => void; //자식에서 props의 타입을 함수 타입으로 정의
  deleteTodo: (id: number) => void; //처음에는 빈값으로 가기 때문에 비어있는 형태로 보낸다
}

function TodoItem({ todo, toggleTodo, deleteTodo }: TodoItemProps) {
  return (
    <li style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}> //할 일이 완료되었으면 텍스트에 취소선을 적용
      {todo.text} //할 일 내용을 화면에 표시
      <button onClick={() => toggleTodo(todo.id)}>
        {todo.completed ? '되돌리기' : '완료'}
      </button>
      <button onClick={() => deleteTodo(todo.id)}>삭제</button>
    </li>
  );
}

export default TodoItem;
