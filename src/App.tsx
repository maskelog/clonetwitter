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
  background: "#000000",
  text: "#FFFFFF",
  svgFill: "#FFFFFF",
  colors: {
    primary: "#0B93F6",
    secondary: "#262D31",
  },
};

const lightTheme = {
  background: "#FFFFFF",
  text: "#333333",
  svgFill: "#333333",
  colors: {
    primary: "#D2E3FC",
    secondary: "#F0F0F0",
  },
};

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

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <NotificationProvider>
            <Layout
              toggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
            />
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
      </Wrapper>
    </ThemeProvider>
  );
}

export default App;
