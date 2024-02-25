import { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import ChatRoom from "../components/ChatRoom";
import defaultAvatar from "../defaultavatar.svg";

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

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

interface IMessage {
  id: string;
  chatId: string;
  userId: string;
  text?: string;
  username?: string;
  createdAt: string;
  avatarUrl?: string;
}

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [rooms, setRooms] = useState<IMessage[]>([]);
  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchRooms = async () => {
      const messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const roomsMap: { [key: string]: IMessage } = {};

        for (const doc of snapshot.docs) {
          const message = { ...doc.data(), id: doc.id } as IMessage;

          if (
            !roomsMap[message.chatId] ||
            new Date(roomsMap[message.chatId].createdAt) <
              new Date(message.createdAt)
          ) {
            roomsMap[message.chatId] = message;
          }
        }

        const roomsDataPromises = Object.keys(roomsMap).map(async (chatId) => {
          const message = roomsMap[chatId];
          const otherUserId =
            message.userId === currentUserUid ? message.chatId : message.userId;

          let avatarUrl = defaultAvatar;
          let username = "Unknown";

          // 아바타 URL 가져오기
          try {
            const avatarRef = ref(storage, `avatars/${otherUserId}`);
            avatarUrl = await getDownloadURL(avatarRef);
          } catch (error) {
            console.error("Error fetching avatar:", error);
          }

          // 사용자 이름 가져오기
          try {
            const userRef = doc(db, "users", otherUserId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              username = userSnap.data().name || "Unknown"; // 'name' 필드 사용
            }
          } catch (error) {
            console.error("Error fetching user info:", error);
          }

          return { ...message, avatarUrl, username };
        });

        const roomsData = await Promise.all(roomsDataPromises);
        setRooms(roomsData);
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
              <div>
                <div>{room.username || "Unknown"}</div>
                <div>{room.text || "No messages yet"}</div>
              </div>
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
