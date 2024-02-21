import React, { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import MessageItem from "./MessageItem";

// IMessage 인터페이스 수정: username 속성 추가
export interface IMessage {
  id: string;
  text: string;
  createdAt: number;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
  username?: string; // 사용자 이름 속성 추가
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
  height: 90vh;
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
        text: doc.data().text || "",
        createdAt: doc.data().createdAt || 0,
        senderId: doc.data().senderId || "",
        senderName: doc.data().senderName || "",
        senderPhotoURL: doc.data().senderPhotoURL || "",
        username: doc.data().username || "Anonymous", // username 속성 불러오기
      }));
      setMessages(messagesArray);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <GlobalStyles />
      <Wrapper>
        <MessagesContainer>
          {messages.map((message) => (
            <MessageItem key={message.id} {...message} />
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>
      </Wrapper>
    </>
  );
};

export default MessageList;
