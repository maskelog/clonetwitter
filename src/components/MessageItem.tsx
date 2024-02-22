import React from "react";
import styled from "styled-components";

interface IMessageItemProps {
  id: string;
  text: string;
  createdAt: number;
  senderId: string;
  username: string;
  currentUserId: string;
  senderPhotoURL?: string;
}

const MessageContainer = styled.div<{ isSentByCurrentUser: boolean }>`
  display: flex;
  flex-direction: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "row-reverse" : "row"};
  align-items: flex-end;
  margin: 5px;
`;

const UserInfoText = styled.div`
  font-size: 0.75em;
  color: #888;
  margin: 0 8px;
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

const Timestamp = styled.span`
  font-size: 0.75em;
  color: #666;
  margin-top: 5px;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const MessageItem: React.FC<IMessageItemProps> = ({
  text,
  createdAt,
  senderId,
  username,
  currentUserId,
  senderPhotoURL,
}) => {
  const isSentByCurrentUser = senderId === currentUserId;
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <MessageContainer isSentByCurrentUser={isSentByCurrentUser}>
      <ProfileImage src={senderPhotoURL || "defaultAvatarUrl"} alt="profile" />
      <div>
        <UserInfoText>{username}</UserInfoText>
        <MessageBubble isSentByCurrentUser={isSentByCurrentUser}>
          {text}
          <Timestamp>{formatTime(createdAt)}</Timestamp>
        </MessageBubble>
      </div>
    </MessageContainer>
  );
};

export default MessageItem;
