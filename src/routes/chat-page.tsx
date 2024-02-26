import { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import defaultAvatar from "../defaultavatar.svg";
import ChatRoom from "../components/ChatRoom";

const ChatPageLayout = styled.div`
  display: flex;
  height: 100vh;
`;

const ChatRoomsList = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  max-height: 80%;
  border-right: 1px solid #ccc;
  font-size: 20px;
`;

const ChatRoomContainer = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const RoomLink = styled(Link)`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.3s;
  border-radius: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background-color: #f0f0f0;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const RoomContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const RoomDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #666;
`;

interface IMessage {
  id: string;
  chatId: string;
  userId: string;
  text?: string;
  username?: string;
  createdAt: any;
  avatarUrl?: string;
}

interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [rooms, setRooms] = useState<IMessage[]>([]);
  const currentUserUid = auth.currentUser?.uid;

  function formatFirestoreTimestamp(timestamp: Timestamp | string | null) {
    if (!timestamp) return "Unknown date";
    if (typeof timestamp === "object") {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    }
    return timestamp;
  }

  useEffect(() => {
    const fetchRooms = async () => {
      const messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const roomsMap: { [key: string]: IMessage } = {};

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const message = {
            ...data,
            id: doc.id,
            createdAt: formatFirestoreTimestamp(data.createdAt),
          } as IMessage;
          if (
            !roomsMap[message.chatId] ||
            new Date(roomsMap[message.chatId].createdAt).getTime() <
              new Date(message.createdAt).getTime()
          ) {
            roomsMap[message.chatId] = message;
          }
        });

        const roomsDataPromises = Object.keys(roomsMap).map(async (chatId) => {
          const message = roomsMap[chatId];
          const otherUserId =
            message.userId === currentUserUid ? message.chatId : message.userId;

          let avatarUrl = defaultAvatar;
          try {
            const avatarRef = ref(storage, `avatars/${otherUserId}`);
            avatarUrl = await getDownloadURL(avatarRef);
          } catch (error) {
            console.error("Error fetching avatar:", error);
            avatarUrl = defaultAvatar;
          }

          let username = "Unknown";
          try {
            const userRef = doc(db, "users", otherUserId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              username = userSnap.data().name || "Unknown";
            }
          } catch (error) {
            console.error("Error fetching user info:", error);
          }

          return {
            ...message,
            avatarUrl,
            username,
          };
        });

        const roomsData = await Promise.all(roomsDataPromises);
        setRooms(
          roomsData.map((room) => ({
            ...room,
            createdAt: formatFirestoreTimestamp(room.createdAt),
          }))
        );
      });

      return () => unsubscribe();
    };

    fetchRooms();
  }, [currentUserUid]);

  return (
    <ChatPageLayout>
      {!roomId && (
        <ChatRoomsList>
          {rooms.map((room) => (
            <RoomLink key={room.id} to={`/chat/${room.chatId}`}>
              <Avatar src={room.avatarUrl} alt="Avatar" />
              <RoomContent>
                <RoomDetails>
                  <div>{room.username || "Unknown"}</div>
                  <div>{room.text || "No messages yet"}</div>
                </RoomDetails>
                <Timestamp>{room.createdAt}</Timestamp>
              </RoomContent>
            </RoomLink>
          ))}
        </ChatRoomsList>
      )}
      {roomId && (
        <ChatRoomContainer>
          <ChatRoom userId={roomId} />
        </ChatRoomContainer>
      )}
    </ChatPageLayout>
  );
}
