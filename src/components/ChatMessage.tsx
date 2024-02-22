import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

const MessageContainer = styled.div<{ isSentByCurrentUser: boolean }>`
  display: flex;
  align-items: center;
  margin: 10px;
  flex-direction: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "row-reverse" : "row"};
`;

const MessageBubble = styled.div<{ isSentByCurrentUser: boolean }>`
  background-color: ${({ isSentByCurrentUser }) =>
    isSentByCurrentUser ? "#DCF8C6" : "#ECECEC"};
  border-radius: 20px;
  padding: 10px 20px;
  color: #333;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 10px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;

  svg,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Nickname = styled.span`
  font-weight: bold;
  margin-right: 10px;
`;

interface ChatMessageProps {
  message: {
    text: string;
    userId: string;
    username: string;
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
          setAvatarUrl("");
        }
      }
    };

    fetchAvatarUrl();
  }, [message.userId]);

  return (
    <MessageContainer isSentByCurrentUser={message.isSentByCurrentUser}>
      <Avatar>
        {avatarUrl ? (
          <img src={avatarUrl} alt="User avatar" />
        ) : (
          <svg
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        )}
      </Avatar>
      <MessageBubble isSentByCurrentUser={message.isSentByCurrentUser}>
        <Nickname>{message.username}</Nickname>
        {message.text}
      </MessageBubble>
    </MessageContainer>
  );
};

export default ChatMessage;
