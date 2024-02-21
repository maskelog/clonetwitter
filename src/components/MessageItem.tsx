import React from "react";
import styled from "styled-components";

interface IMessageItemProps {
  id: string;
  text: string;
  createdAt: number;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
  username: string;
  currentUserId: string;
}

const MessageContainer = styled.div<{ isSentByCurrentUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "flex-end" : "flex-start"};
  margin: 5px;
`;

const UserInfoText = styled.div`
  font-size: 0.75em;
  color: #888;
  margin-bottom: 2px;
`;

const MessageBubble = styled.div<{ isSentByCurrentUser: boolean }>`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 20px;
  background-color: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "#dcf8c6" : "#f0f0f0"};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  color: #333;
`;

const Timestamp = styled.span<{ isSentByCurrentUser: boolean }>`
  font-size: 0.75em;
  color: #666;
  display: block;
  margin-top: 5px;
  text-align: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "right" : "left"};
`;

const MessageItem: React.FC<IMessageItemProps> = ({
  text,
  createdAt,
  senderId,
  username,
  isSentByCurrentUser,
}) => {
  // 날짜 포맷팅 함수 수정
  const formatTime = (timestamp: number) => {
    // 숫자 타입의 timestamp를 사용하여 Date 객체 생성
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <MessageContainer isSentByCurrentUser={isSentByCurrentUser}>
      <UserInfoText>{username}</UserInfoText>
      <MessageBubble isSentByCurrentUser={isSentByCurrentUser}>
        {text}
        <Timestamp isSentByCurrentUser={isSentByCurrentUser}>
          {formatTime(createdAt)}
        </Timestamp>
      </MessageBubble>
    </MessageContainer>
  );
};

export default MessageItem;
