import { useState, useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import styled from "styled-components";
import Layout from "./components/layout";
import Profile from "./routes/profile";
import Home from "./routes/home";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import ForgotPassword from "./routes/forgot-password";
import ChatPage from "./routes/chat-page";
import { NotificationProvider } from "./components/NotificationProvider";
import TweetDetail from "./components/tweetDetail";
import BookmarkPage from "./routes/bookmark-page";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./firebase";
import { reset } from "styled-reset";
import ProtectedRoute from "./components/protected-route";

const darkTheme = {
  background: "#020202",
  color: "white",
};

const lightTheme = {
  background: "#FFF",
  color: "#333",
};

const ToggleButton = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  background-color: ${(props) =>
    props.theme.background === "#FFF" ? "#ccc" : "#333"};
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.2s;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${(props) => (props.theme.background === "#FFF" ? "2px" : "26px")};
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

const GlobalStyles = createGlobalStyle`
  ${reset}
  * {
    box-sizing: border-box;
  }
  body {
    background-color: ${(props) => props.theme.background};
    color: ${(props) => props.theme.color};
    font-family: 'system-ui', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`;

function App() {
  const [isLoading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    auth.onAuthStateChanged(() => {
      setLoading(false);
    });
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <NotificationProvider>
            <Layout toggleTheme={toggleTheme} />
          </NotificationProvider>
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Home /> },
        { path: "/profile", element: <Profile /> },
        { path: "/profile/:userId", element: <Profile /> },
        {
          path: "chat",
          element: <ChatPage />,
          children: [{ path: ":roomId", element: <ChatPage /> }],
        },
        { path: "tweets/:tweetId", element: <TweetDetail /> },
        { path: "/BookmarkPage", element: <BookmarkPage /> },
      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/create-account", element: <CreateAccount /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
  ]);

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyles />
      <Wrapper>
        {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
        <ToggleButton onClick={toggleTheme} />
      </Wrapper>
    </ThemeProvider>
  );
}

export default App;
