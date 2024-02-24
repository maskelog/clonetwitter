import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
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
  align-items: center;
  flex-direction: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "row-reverse" : "row"};
`;

const MessageBubble = styled.div<{ isSentByCurrentUser: boolean }>`
  background-color: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "#DCF8C6" : "#ECECEC"};
  border-radius: 20px;
  padding: 10px 20px;
  color: #333;
  margin: 0 10px;
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

const Timestamp = styled.span`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

interface ChatMessageProps {
  message: {
    text: string;
    userId: string;
    username: string;
    createdAt: string;
    isSentByCurrentUser: boolean;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (message.userId) {
        try {
          const avatarRef = ref(storage, `avatars/${message.userId}`);
          const url = await getDownloadURL(avatarRef);
          setAvatarUrl(url);
        } catch (error) {
          console.log("Avatar image not found or error fetching:", error);
          // 에러 발생 시 기본 아바타 설정은 필요 없음, useState의 초기값이 이를 처리
        }
      }
    };

    fetchAvatarUrl();
  }, [message.userId]);

  return (
    <MessageContainer isSentByCurrentUser={message.isSentByCurrentUser}>
      <MessageContent isSentByCurrentUser={message.isSentByCurrentUser}>
        <Avatar isSentByCurrentUser={message.isSentByCurrentUser}>
          <img src={avatarUrl || defaultAvatar} alt="User avatar" />
        </Avatar>
        <MessageBubble isSentByCurrentUser={message.isSentByCurrentUser}>
          {message.text}
        </MessageBubble>
      </MessageContent>
      <Timestamp>{message.createdAt}</Timestamp>
    </MessageContainer>
  );
};

export default ChatMessage;
