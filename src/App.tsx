import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AccessTokenProvider } from './contexts/AccessProvider';
import { UserDataProvider } from './contexts/UserProvider';
import MyProfile from './pages/MyProfile';


function App() {

  return (
    <>
      <Router>
        <AccessTokenProvider>
          <UserDataProvider>
            <Routes>
              <Route path="my-profile" element={<MyProfile />} />
            </Routes>
          </UserDataProvider>
        </AccessTokenProvider>
      </Router>
    </>
  );
}

export default App;
