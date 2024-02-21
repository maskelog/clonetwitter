import React, { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import MessageItem from "./MessageItem";

interface IMessage {
  id: string;
  text: string;
  createdAt: Date;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
}

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: black;
    color: white;
    font-family: 'system-ui', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  background-color: #2c2c2c;
  color: white;
`;

const MessageList = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesArray: IMessage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        createdAt: doc.data().createdAt.toDate(),
        senderId: doc.data().senderId,
        senderName: doc.data().senderName,
        senderPhotoURL: doc.data().senderPhotoURL,
      }));
      setMessages(messagesArray);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  return (
    <MessagesContainer>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

export default function ChatRoom() {
  return (
    <>
      <GlobalStyles />
      <Wrapper>
        <MessageList />
      </Wrapper>
    </>
  );
}
