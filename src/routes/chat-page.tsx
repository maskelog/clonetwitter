import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  orderBy,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import ChatRoom from "../components/ChatRoom";
import defaultAvatar from "../defaultavatar.svg"; // 기본 아바타 이미지 경로

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

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [rooms, setRooms] = useState<DocumentData[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const roomsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            let avatarUrl = defaultAvatar;
            try {
              const avatarRef = ref(storage, `avatars/${data.userId}`);
              avatarUrl = await getDownloadURL(avatarRef);
            } catch (error) {
              console.error("Avatar image not found or error fetching:", error);
            }
            return { ...data, id: doc.id, avatarUrl }; // 각 채팅방 데이터에 avatarUrl 추가
          })
        );
        setRooms(roomsData);
      });
      return () => unsubscribe();
    };

    fetchRooms();
  }, []);

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
