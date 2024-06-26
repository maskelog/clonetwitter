import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { auth, db } from "../firebase";
import {
  query,
  collection,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";

interface NotificationContextType {
  hasNotification: boolean;
  hasBookmark: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  hasNotification: false,
  hasBookmark: false,
});

interface Props {
  children: ReactNode;
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<Props> = ({ children }) => {
  const [hasNotification, setHasNotification] = useState<boolean>(false);
  const [hasBookmark, setHasBookmark] = useState<boolean>(false);

  useEffect(() => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) {
      setHasNotification(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];

    const chatRoomsRef = query(
      collection(db, "chatRooms"),
      where("participants", "array-contains", currentUserUid)
    );

    const chatRoomsSub = onSnapshot(chatRoomsRef, (chatRoomsSnapshot) => {
      const totalRooms = chatRoomsSnapshot.docs.length;
      let checkedRooms = 0;

      if (totalRooms === 0) {
        setHasNotification(false);
      } else {
        chatRoomsSnapshot.docs.forEach((doc) => {
          const chatRoomId = doc.id;
          const messagesRef = query(
            collection(db, "messages"),
            where("chatId", "==", chatRoomId),
            orderBy("createdAt", "desc"),
            limit(1)
          );

          const messagesSub = onSnapshot(messagesRef, (messagesSnapshot) => {
            const unread = messagesSnapshot.docs.some(
              (doc) => !doc.data().read.includes(currentUserUid)
            );

            if (unread) {
              setHasNotification(true);
            } else {
              checkedRooms += 1;
              if (checkedRooms === totalRooms) {
                setHasNotification(false);
              }
            }
          });

          unsubscribes.push(messagesSub);
        });
      }
    });

    unsubscribes.push(chatRoomsSub);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // 북마크 알림 로직을 별도의 useEffect 훅으로 분리
  useEffect(() => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) {
      setHasBookmark(false);
      return;
    }

    const bookmarksRef = query(
      collection(db, "bookmarks"),
      where("userId", "==", currentUserUid)
    );

    const bookmarksSub = onSnapshot(bookmarksRef, (snapshot) => {
      setHasBookmark(snapshot.docs.length > 0);
    });

    return () => {
      bookmarksSub();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ hasNotification, hasBookmark }}>
      {children}
    </NotificationContext.Provider>
  );
};
