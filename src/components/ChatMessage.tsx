import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import defaultAvatar from "../defaultavatar.svg";
import { deleteDoc, doc } from "firebase/firestore";

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

const Button = styled.button`
  background-color: white;
  color: black;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  /* padding: 10px; */

  &:hover {
    background-color: #f92626;
  }
`;

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    userId: string;
    username: string;
    createdAt: string;
    isSentByCurrentUser: boolean;
    read: string[];
    imageUrl?: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(defaultAvatar);
  const currentUserUid = auth.currentUser?.uid;
  const isSentByCurrentUser = message.userId === currentUserUid;

  const isReadByOther =
    (isSentByCurrentUser && message.read.length > 1) ||
    (isSentByCurrentUser &&
      message.read.length === 1 &&
      !message.read.includes(currentUserUid));

  useEffect(() => {
    if (!message.isSentByCurrentUser && message.userId) {
      const avatarRef = ref(storage, `avatars/${message.userId}`);
      getDownloadURL(avatarRef)
        .then(setAvatarUrl)
        .catch(() => setAvatarUrl(defaultAvatar));
    }
  }, [message.userId, message.isSentByCurrentUser]);
  const deleteMessage = async (messageId: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, "messages", messageId));
        console.log("Message deleted successfully");
      } catch (error) {
        console.log("Error deleting message:", error);
      }
    }
  };
  return (
    <MessageContainer isSentByCurrentUser={isSentByCurrentUser}>
      <UserInfoContainer isSentByCurrentUser={isSentByCurrentUser}>
        <Avatar isSentByCurrentUser={isSentByCurrentUser}>
          <img src={avatarUrl} alt="User avatar" />
        </Avatar>
        <Username>{message.username}</Username>
      </UserInfoContainer>
      <MessageContent isSentByCurrentUser={isSentByCurrentUser}>
        {message.imageUrl && (
          <Image src={message.imageUrl} alt="Attached image" />
        )}
        <MessageBubble isSentByCurrentUser={isSentByCurrentUser}>
          {message.text}
        </MessageBubble>
        {isSentByCurrentUser && (
          <Button onClick={() => deleteMessage(message.id)}>삭제</Button>
        )}
        <Timestamp isSentByCurrentUser={isSentByCurrentUser}>
          {message.createdAt}
          {!isReadByOther && isSentByCurrentUser && (
            <ReadStatus>읽지 않음</ReadStatus>
          )}
        </Timestamp>
      </MessageContent>
    </MessageContainer>
  );
};

export default ChatMessage;
