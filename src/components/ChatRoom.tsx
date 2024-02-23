import React, { FormEvent, useEffect, useState } from "react";
import styled from "styled-components";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import ChatMessage from "./ChatMessage";

const ChatLayout = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  flex-direction: column;
  flex-grow: 1;
  background-color: #f0f0f0;
`;

const MessagesList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: white;
`;

const MessageForm = styled.form`
  display: flex;
  padding: 10px;
  background-color: #eee;
`;

const Input = styled.input`
  flex-grow: 1;
  margin-right: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

interface IMessage {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: { seconds: number; nanoseconds: number };
  isSentByCurrentUser: boolean;
}

interface ChatRoomProps {
  userId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ userId }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", userId),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt =
          data.createdAt?.toDate().toLocaleString() || "Unknown date";
        return {
          id: doc.id,
          ...data,
          createdAt,
          isSentByCurrentUser: data.userId === userId,
        };
      });
      setMessages(fetchedMessages);
      console.log("Fetched Messages:", fetchedMessages);
    });
  }, [userId]);

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    await addDoc(collection(db, "messages"), {
      text: newMessage,
      createdAt: new Date(),
      chatId: userId,
      userId,
    });

    setNewMessage("");
  };

  return (
    <ChatLayout>
      <ChatContainer>
        <MessagesList>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </MessagesList>
        <MessageForm onSubmit={handleSend}>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
          />
          <Button type="submit">보내기</Button>
        </MessageForm>
      </ChatContainer>
    </ChatLayout>
  );
};

export default ChatRoom;
