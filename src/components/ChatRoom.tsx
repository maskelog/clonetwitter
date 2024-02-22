import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import ChatMessage from "./ChatMessage";

const ChatLayout = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  border-radius: 0;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  background-color: #f0f0f0;
  overflow: hidden;
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
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ChatRoom = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("chatId", "==", userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (newMessage.trim() === "") return;

    await addDoc(collection(db, "messages"), {
      text: newMessage,
      createdAt: new Date(),
      chatId: userId,
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
