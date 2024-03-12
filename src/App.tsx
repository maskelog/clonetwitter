import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import Profile from "./routes/profile";
import Home from "./routes/home";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import { createGlobalStyle } from "styled-components";
import { reset } from "styled-reset";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./firebase";
import styled from "styled-components";
import ProtectedRoute from "./components/protected-route";
import ForgotPassword from "./routes/forgot-password";
import ChatPage from "./routes/chat-page";
import { NotificationProvider } from "./components/NotificationProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <NotificationProvider>
          <Layout />
        </NotificationProvider>
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <Home /> },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/profile/:userId",
        element: <Profile />,
      },
      {
        path: "chat",
        element: <ChatPage />,
        children: [{ path: ":roomId", element: <ChatPage /> }],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/create-account", element: <CreateAccount /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
]);

const GlobalStyles = createGlobalStyle`
${reset};
*{
  box-sizing: border-box;
}
body {
  background-color: black;
  color: white;
  font-family: 'system-ui', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

function App() {
  const [isLoading, setLoading] = useState(true);
  const init = async () => {
    await auth.authStateReady();
    setLoading(false);
    // setTimeout(() => setLoading(false), 2000);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <Wrapper>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </Wrapper>
  );
}

export default App;
