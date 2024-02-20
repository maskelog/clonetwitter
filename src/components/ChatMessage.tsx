import React from "react";
import styled from "styled-components";

const MessageContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 10px;
`;

const MessageBubble = styled.div<{ isSentByCurrentUser: boolean }>`
  background-color: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "#DCF8C6" : "#ECECEC"};
  border-radius: 20px;
  padding: 10px 20px;
  margin: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "0 0 0 auto" : "0 auto 0 0"};
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const Nickname = styled.span`
  font-weight: bold;
  margin-right: 10px;
`;

interface ChatMessageProps {
  text: string;
  sentBy: string;
  isSentByCurrentUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  text,
  sentBy,
  isSentByCurrentUser,
}) => {
  return (
    <MessageContainer>
      {!isSentByCurrentUser && (
        <Avatar src="/path/to/avatar.jpg" alt="Avatar" />
      )}
      <MessageBubble isSentByCurrentUser={isSentByCurrentUser}>
        {!isSentByCurrentUser && <Nickname>{sentBy}</Nickname>}
        {text}
      </MessageBubble>
    </MessageContainer>
  );
};

export default ChatMessage;
