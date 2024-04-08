import styled, { keyframes } from "styled-components";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useNotifications } from "./NotificationProvider";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 65px 1fr;
  margin: 10px;
  gap: 5px;
  grid-template-rows: 100vh;
  grid-template-areas: "menu content";
  height: 100vh;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 50px;
    grid-template-areas:
      "content"
      "menu";
  }
`;

const Content = styled.div`
  grid-area: content;
  overflow-y: auto;
  min-width: 600px;
  width: 100%;
`;

const shimmer = keyframes`
  0% {
    background-position: -468px 0
  }
  100% {
    background-position: 468px 0
  }
`;

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 20px;
  margin-bottom: 5px;
  background-color: #000;
  color: #fff;
  position: relative;
  padding-bottom: 60px;
  line-height: 120%;
`;

const SkeletonItem = styled.div`
  background: #333;
  background-image: linear-gradient(
    to right,
    #333 0%,
    #999 20%,
    #333 40%,
    #333 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 104px;
  display: inline-block;
  line-height: 1;
  width: 100%;
  height: 20px;
  animation-duration: 1.5s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-name: ${shimmer};
  animation-timing-function: linear;
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Menu = styled.nav`
  grid-area: menu;
  background-color: black;
  padding: 10px;
  position: fixed;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    z-index: 10;
  }
`;

const NotificationDot = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
`;

const MenuItem = styled.div<MenuItemProps>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  position: relative;

  svg {
    width: 30px;
    fill: ${(props) => (props.isBookmarked ? "#f0b90b" : "white")};
  }

  &.log-out {
    border-color: tomato;
    svg {
      fill: tomato;
    }
  }
`;

interface MenuItemProps {
  isBookmarked?: boolean;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const { hasNotification, hasBookmark } = useNotifications();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const onLogOut = async () => {
    const ok = window.confirm("Are you sure you want to log out?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };

  return (
    <Wrapper>
      <Menu>
        <Link to="/">
          <MenuItem>
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
              />
            </svg>
          </MenuItem>
        </Link>
        <Link to="/profile">
          <MenuItem>
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
            </svg>
          </MenuItem>
        </Link>
        <Link to="/chat">
          <MenuItem>
            {hasNotification && <NotificationDot />}
            <svg
              fill="none"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>
          </MenuItem>
        </Link>
        <Link to="/BookmarkPage">
          <MenuItem isBookmarked={hasBookmark}>
            <svg
              fill="none"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              />
            </svg>
          </MenuItem>
        </Link>
        <MenuItem onClick={onLogOut} className="log-out">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
            />
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
            />
          </svg>
        </MenuItem>
      </Menu>
      <Content>
        {isLoading ? (
          <>
            <SkeletonWrapper>
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </SkeletonWrapper>
            <SkeletonWrapper>
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </SkeletonWrapper>
          </>
        ) : (
          <Outlet />
        )}
      </Content>
    </Wrapper>
  );
};

export default Layout;
