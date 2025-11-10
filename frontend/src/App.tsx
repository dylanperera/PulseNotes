import { Route, MemoryRouter as Router, Routes } from "react-router-dom";
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
