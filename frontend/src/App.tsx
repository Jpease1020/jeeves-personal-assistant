import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { APIProvider } from './providers/APIProvider';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Chat } from './views/Chat';
import { MorningRoutine } from './views/MorningRoutine';
import { Quiz } from './views/Quiz';
import { BodyTracker } from './views/BodyTracker';
import { Settings } from './views/Settings';

function App() {
  return (
    <APIProvider>
      <WebSocketProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/routine" element={<MorningRoutine />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/tracker" element={<BodyTracker />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </WebSocketProvider>
    </APIProvider>
  );
}

export default App;
