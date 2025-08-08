import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NewLead from './pages/NewLead';
import Leads from './pages/Leads';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NewLead />} />
        <Route path="/leads" element={<Leads />} />
      </Routes>
    </Router>
  );
}

export default App;
