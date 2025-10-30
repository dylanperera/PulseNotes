import React from "react";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import TranscriptionPage from "./views/TranscriptionPage/TranscriptionPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TranscriptionPage />} />
        {/* <Route path="/summary" element={<SummaryPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
