import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  flex-direction: column;
  height: 100vh;
`;

const ChatRoomsList = styled.div`
  padding: 20px;
`;

const RoomLink = styled(Link)`
  display: block;
  margin-bottom: 10px;
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
      <ChatRoomsList>
        {rooms.map((room: DocumentData) => (
          <RoomLink key={room.id} to={`/chat/${room.chatId}`}>
            {room.text || "No messages yet"}
          </RoomLink>
        ))}
      </ChatRoomsList>
      {roomId && <ChatRoom userId={roomId} />}
    </ChatPageLayout>
  );
};

export default ChatPage;
