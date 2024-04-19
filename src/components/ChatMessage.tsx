import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { auth, db } from "../firebase";
import defaultAvatar from "../defaultavatar.svg";
import { deleteDoc, doc, getDoc } from "firebase/firestore";

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
  background-color: ${({ isSentByCurrentUser, theme }) =>
    isSentByCurrentUser ? theme.colors.primary : theme.colors.secondary};
  color: ${(props) => props.theme.text};
  border-radius: 20px;
  padding: 10px 20px;
  margin: 0 10px;
`;

const Username = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.text};
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
  color: #adb5bd;
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
  background-color: #333;
  color: #fff;
  cursor: pointer;
  border: 1px solid #444;
  margin-top: 5px;
  border-radius: 4px;
  padding: 2px 5px;

  &:hover {
    background-color: #555;
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
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    photoURL: string;
  }>({
    displayName: "Loading...",
    photoURL: defaultAvatar,
  });
  const currentUserUid = auth.currentUser?.uid;
  const isSentByCurrentUser = message.userId === currentUserUid;

  const isReadByOther =
    (isSentByCurrentUser && message.read.length > 1) ||
    (isSentByCurrentUser &&
      message.read.length === 1 &&
      !message.read.includes(currentUserUid));

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (message.userId) {
        const userRef = doc(db, "users", message.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserProfile({
            displayName: userData.displayName || "Anonymous",
            photoURL: userData.photoURL || defaultAvatar,
          });
        }
      }
    };

    fetchUserProfile();
  }, [message.userId]);

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
          <img src={userProfile.photoURL} alt="User avatar" />
        </Avatar>
        <Username>{userProfile.displayName}</Username>
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
