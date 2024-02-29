import React, { FormEvent, useEffect, useState } from "react";
import styled from "styled-components";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import ChatMessage from "./ChatMessage";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

const ChatLayout = styled.div`
  display: flex;
  width: 100vw;
  max-width: 800px;
  height: 50vh;
  margin: 0 auto;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #f0f0f0;
  overflow: hidden;
`;

const MessagesList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: white;
  margin-bottom: auto;
`;

const MessageForm = styled.form`
  display: flex;
  padding: 10px;
  background-color: #eee;
`;

const Input = styled.input`
  flex-grow: 1;
  margin-right: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: transparent;
  border: none;
  padding: 10px;
  font-size: 24px;
  cursor: pointer;

  &:hover {
    color: #007bff;
  }
`;

interface IMessage {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: Date | string;
  isSentByCurrentUser: boolean;
  read: string[];
}

interface ChatRoomProps {
  userId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", userId),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const updatedMessages: IMessage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        userId: doc.data().userId,
        username: doc.data().username,
        createdAt: doc.data().createdAt.toDate().toLocaleString(),
        isSentByCurrentUser: doc.data().userId === auth.currentUser?.uid,
        read: doc.data().read || [],
      }));

      // Update messages state
      setMessages(updatedMessages);

      // Mark messages as read
      markMessagesAsRead(updatedMessages);
    });

    return unsubscribe;
  }, [userId]);

  const markMessagesAsRead = async (updatedMessages: IMessage[]) => {
    const unreadMessages = updatedMessages.filter(
      (msg) =>
        !msg.read.includes(auth.currentUser!.uid) &&
        msg.userId !== auth.currentUser!.uid
    );
    unreadMessages.forEach((msg) => {
      const msgRef = doc(db, "messages", msg.id);
      updateDoc(msgRef, {
        read: [...msg.read, auth.currentUser!.uid],
      });
    });
  };

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.currentUser || newMessage.trim() === "") return;

    await addDoc(collection(db, "messages"), {
      text: newMessage,
      createdAt: serverTimestamp(),
      chatId: userId,
      userId: auth.currentUser.uid,
      username: auth.currentUser.displayName || "Anonymous",
      read: [auth.currentUser.uid], // Initially mark the message as read by the sender
    });

    setNewMessage("");
  };

  const handleBack = () => navigate(-1);

  return (
    <ChatLayout>
      <ChatContainer>
        <BackButton onClick={handleBack}>
          <IoIosArrowBack />
        </BackButton>
        <MessagesList>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </MessagesList>
        <MessageForm onSubmit={handleSend}>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
          />
          <Button type="submit">보내기</Button>
        </MessageForm>
      </ChatContainer>
    </ChatLayout>
  );
};

export default ChatRoom;
