import React from "react";
import styled from "styled-components";
import MessageList from "./MessageList";
import SendMessageForm from "./SendMessageForm";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 100%;
  background-color: #121212;
  color: #fff;
  overflow: hidden;
`;

const ChatSidebar = styled.div`
  flex: 1;
  max-width: 300px;
  border-right: 1px solid #333;
  overflow-y: auto;
  width: 100%;
`;

const ChatMain = styled.div`
  flex: 3;
  overflow-y: auto;
  width: 100%;
`;

const ChatRoom = () => {
  return (
    <ChatContainer>
      <ChatSidebar>{/* 사이드바 컴포넌트 또는 콘텐츠 */}</ChatSidebar>
      <ChatMain>
        <MessageList />
        <SendMessageForm />
      </ChatMain>
    </ChatContainer>
  );
};

export default ChatRoom;
