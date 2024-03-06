import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase";
import defaultAvatar from "../defaultavatar.svg";

const MessageContainer = styled.div<{ isSentByCurrentUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "flex-end" : "flex-start"};
  margin: 10px;
`;

const MessageContent = styled.div<{ isSentByCurrentUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "flex-end" : "flex-start"};
`;

const MessageBubble = styled.div<{ isSentByCurrentUser: boolean }>`
  background-color: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "#DCF8C6" : "#ECECEC"};
  border-radius: 20px;
  padding: 10px 20px;
  color: #333;
  margin: 0 10px;
`;

const Username = styled.span`
  font-size: 14px;
  color: #555;
  margin: 5px 10px;
`;

const UserInfoContainer = styled.div<{ isSentByCurrentUser: boolean }>`
  display: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "none" : "flex"};
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 5px;
`;

const Avatar = styled.div<{ isSentByCurrentUser: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "#DCF8C6" : "#ECECEC"};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Timestamp = styled.div<{ isSentByCurrentUser: boolean }>`
  align-self: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "flex-end" : "flex-start"};
  margin-top: auto;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

const ReadStatus = styled.span`
  font-size: 12px;
  color: #888;
  margin-left: 10px;
`;

const Image = styled.img`
  max-width: 200px;
  border-radius: 8px;
  margin-bottom: 10px;
`;
interface ChatMessageProps {
  message: {
    text: string;
    userId: string;
    username: string;
    createdAt: string;
    isSentByCurrentUser: boolean;
    read: string[];
    imageUrl?: string;
    chatId?: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(defaultAvatar);
  const currentUserUid = auth.currentUser?.uid;
  const otherUserId =
    message.chatId && currentUserUid
      ? message.chatId.split("-").find((id) => id !== currentUserUid)
      : null;

  useEffect(() => {
    if (otherUserId) {
      const avatarRef = ref(storage, `avatars/${otherUserId}`);
      getDownloadURL(avatarRef)
        .then(setAvatarUrl)
        .catch(() => setAvatarUrl(defaultAvatar));
    }
  }, [otherUserId]);

  const isUnreadByOtherUser =
    message.userId === currentUserUid &&
    (!message.read || !message.read.includes(otherUserId || ""));

  return (
    <MessageContainer isSentByCurrentUser={message.userId === currentUserUid}>
      <UserInfoContainer
        isSentByCurrentUser={message.userId === currentUserUid}
      >
        <Avatar isSentByCurrentUser={message.userId === currentUserUid}>
          <img src={avatarUrl} alt="User avatar" />
        </Avatar>
        <Username>{message.username}</Username>
      </UserInfoContainer>
      <MessageContent isSentByCurrentUser={message.userId === currentUserUid}>
        {message.imageUrl && (
          <Image src={message.imageUrl} alt="Attached image" />
        )}
        <MessageBubble isSentByCurrentUser={message.userId === currentUserUid}>
          {message.text}
        </MessageBubble>
        <Timestamp isSentByCurrentUser={message.userId === currentUserUid}>
          {message.createdAt}
          {isUnreadByOtherUser && <ReadStatus>읽지 않음</ReadStatus>}
        </Timestamp>
      </MessageContent>
    </MessageContainer>
  );
};

export default ChatMessage;
