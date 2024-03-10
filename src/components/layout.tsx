import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 4fr;
  height: 100%;
  padding: 50px 0px;
  width: 100%;
  max-width: 860px;

  @media (max-width: 768px) {
    grid-template-columns: unset;
  }
`;

const Menu = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
  gap: 20px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
  @media (min-width: 769px) {
    position: relative;
    bottom: unset;
    left: unset;
    width: unset;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 20px;
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

const MenuItem = styled.div`
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
    fill: white;
  }
  &.log-out {
    border-color: tomato;
    svg {
      fill: tomato;
    }
  }
`;

export default function Layout() {
  const navigate = useNavigate();
  const [hasNotification, setHasNotification] = useState(false);

  useEffect(() => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) {
      setHasNotification(false);
      return;
    }

    const unsubscribeFromChatRooms = query(
      collection(db, "chatRooms"),
      where("participants", "array-contains", currentUserUid)
    );

    const chatRoomsUnsubscribe = onSnapshot(
      unsubscribeFromChatRooms,
      async (chatRoomsSnapshot) => {
        const userChatRoomIds = chatRoomsSnapshot.docs.map((doc) => doc.id);
        let hasUnreadMessages = false;

        for (const chatRoomId of userChatRoomIds) {
          const messagesQuery = query(
            collection(db, "messages"),
            where("chatId", "==", chatRoomId),
            orderBy("createdAt", "desc"),
            limit(1)
          );

          const messagesUnsubscribe = onSnapshot(
            messagesQuery,
            (messagesSnapshot) => {
              messagesSnapshot.forEach((doc) => {
                const messageData = doc.data();
                if (!messageData.read.includes(currentUserUid)) {
                  hasUnreadMessages = true;
                }
              });

              setHasNotification(hasUnreadMessages);
            }
          );
        }
      }
    );

    return () => {
      chatRoomsUnsubscribe();
    };
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
              stroke="currentColor"
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
      <Outlet />
    </Wrapper>
  );
}
