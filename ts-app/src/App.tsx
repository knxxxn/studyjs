import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Todo from './pages/Todo';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Todo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;