import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import { collection, query, where, onSnapshot } from "firebase/firestore";
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
  const { roomId } = useParams();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const messagesQuery = query(collection(db, "messages"));
        const querySnapshot = await onSnapshot(messagesQuery, (snapshot) => {
          const roomIds = new Set();
          snapshot.forEach((doc) => {
            const data = doc.data();
            roomIds.add(data.chatId);
          });
          const roomIdsArray = Array.from(roomIds);
          setRooms(roomIdsArray);
        });
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  return (
    <ChatPageLayout>
      <ChatRoomsList>
        {rooms.map((roomId) => (
          <RoomLink key={roomId} to={`/chat/${roomId}`}>
            Chat Room: {roomId}
          </RoomLink>
        ))}
      </ChatRoomsList>
      {roomId && <ChatRoom userId={roomId} />}
    </ChatPageLayout>
  );
};

export default ChatPage;
