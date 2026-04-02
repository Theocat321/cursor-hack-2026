import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StartingWebsite from './starting-website/StartingWebsite';
import Dashboard from './dashboard/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/website" element={<StartingWebsite />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
