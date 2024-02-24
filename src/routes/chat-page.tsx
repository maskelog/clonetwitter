import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  collection,
  query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";
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
  flex: 1;
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
  color: white;
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

const ChatPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [rooms, setRooms] = useState<DocumentData[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const messagesQuery = query(collection(db, "messages"));
        const unsubscribe = onSnapshot(
          messagesQuery,
          (snapshot: QuerySnapshot<DocumentData>) => {
            const lastMessages = new Map<string, DocumentData>();
            snapshot.forEach((doc) => {
              const data = doc.data();
              const chatId = data.chatId;
              const message = { id: doc.id, ...data };
              if (
                !lastMessages.has(chatId) ||
                message.createdAt > lastMessages.get(chatId).createdAt
              ) {
                lastMessages.set(chatId, message);
              }
            });
            setRooms(Array.from(lastMessages.values()));
          }
        );
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  return (
    <ChatPageLayout>
      {!roomId && (
        <ChatRoomsList>
          {rooms.map((room: DocumentData) => (
            <RoomLink key={room.id} to={`/chat/${room.chatId}`}>
              {room.text || "No messages yet"}
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
};

export default ChatPage;
