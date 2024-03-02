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

interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

interface Room {
  id: string;
  chatId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
  text: string;
}

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) return;

    const unsubscribe = onSnapshot(
      query(collection(db, "messages"), orderBy("createdAt", "desc")),
      async (snapshot) => {
        const roomsMap: { [key: string]: Room } = {};
        const userInfos: {
          [key: string]: { username: string; avatarUrl: string };
        } = {};

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();
          const chatId = data.chatId;

          const otherUserId = chatId
            .replace(currentUserUid, "")
            .replace("-", "");

          if (roomsMap[chatId]) continue;

          if (!userInfos[otherUserId]) {
            const userSnap = await getDoc(doc(db, "users", otherUserId));
            if (userSnap.exists()) {
              const { name, avatarUrl } = userSnap.data();
              userInfos[otherUserId] = {
                username: name || "Unknown",
                avatarUrl: avatarUrl || defaultAvatar,
              };
            } else {
              userInfos[otherUserId] = {
                username: "Unknown",
                avatarUrl: defaultAvatar,
              };
            }
          }

          roomsMap[chatId] = {
            id: docSnapshot.id,
            chatId,
            userId: otherUserId,
            username: userInfos[otherUserId].username,
            avatarUrl: userInfos[otherUserId].avatarUrl,
            createdAt: data.createdAt.toDate().toLocaleString(),
            text: data.text,
          };
        }

        setRooms(Object.values(roomsMap));
      }
    );

    return () => unsubscribe();
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
