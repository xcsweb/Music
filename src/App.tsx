import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LevelPlay from './pages/LevelPlay';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level/:id" element={<LevelPlay />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
