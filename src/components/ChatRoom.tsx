import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
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
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import ChatMessage from "./ChatMessage";
import { useNavigate } from "react-router-dom";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { IoIosArrowBack } from "react-icons/io";

const ChatLayout = styled.div`
  display: flex;
  width: 100%;
  max-width: 800px;
  height: 100vh;
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
  height: auto;
  padding-bottom: 50px;
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
  border: none;
  padding: 10px;

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

const FileUploadButton = styled.label<{ isImageUploaded: boolean }>`
  background-color: ${({ isImageUploaded }) =>
    isImageUploaded ? "#4CAF50" : "#007bff"};
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background-color: ${({ isImageUploaded }) =>
      isImageUploaded ? "#45a049" : "#0056b3"};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

interface IMessage {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: string;
  isSentByCurrentUser: boolean;
  read: string[];
  imageUrl?: string;
}

const ChatRoom: React.FC<{ userId: string }> = ({ userId }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  const markMessageAsRead = async (messageId: string, userId: string) => {
    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, {
        read: arrayUnion(userId),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  useEffect(() => {
    const checkRoomAccess = async () => {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        console.error("No user logged in");
        navigate("/login");
        return;
      }

      const chatRoomRef = doc(db, "chatRooms", userId);
      const chatRoomSnap = await getDoc(chatRoomRef);

      if (chatRoomSnap.exists()) {
        const chatRoomData = chatRoomSnap.data();
        if (!chatRoomData.participants.includes(currentUserId)) {
          alert("접근 권한이 없습니다.");
          navigate("/");
          return;
        }
      } else {
        alert("채팅방이 존재하지 않습니다.");
        navigate("/");
        return;
      }

      // 채팅 메시지 구독 설정
      const messagesQuery = query(
        collection(db, "messages"),
        where("chatId", "==", userId),
        orderBy("createdAt")
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const updatedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          userId: doc.data().userId,
          username: doc.data().username,
          createdAt: doc.data().createdAt.toDate().toLocaleString(),
          isSentByCurrentUser: doc.data().userId === currentUserId,
          read: doc.data().read || [],
          imageUrl: doc.data().imageUrl,
        }));

        setMessages(updatedMessages);

        // 메시지 읽음 처리
        updatedMessages.forEach((msg) => {
          if (!msg.isSentByCurrentUser && !msg.read.includes(currentUserId)) {
            markMessageAsRead(msg.id, currentUserId);
          }
        });
      });

      return () => unsubscribe();
    };

    checkRoomAccess();
  }, [userId, navigate]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setIsImageUploaded(true);
    }
  };

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentUserId = auth.currentUser?.uid;
    const currentUsername = auth.currentUser?.displayName || "Anonymous";
    if (isLoading || (!newMessage.trim() && !image) || !currentUserId) {
      return;
    }
    setLoading(true);

    let imageUrl = "";
    if (image) {
      const imageName = `${new Date().getTime()}_${image.name}`;
      const imageRef = storageRef(storage, `chatImages/${imageName}`);
      try {
        const uploadResult = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(uploadResult.ref);
      } catch (error) {
        console.error("Error uploading image:", error);
        setLoading(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage.trim(),
        chatId: userId,
        userId: currentUserId,
        username: currentUsername,
        createdAt: serverTimestamp(),
        imageUrl,
        read: [currentUserId],
      });
      setNewMessage("");
      setImage(null);
      setIsImageUploaded(false);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
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
          <FileUploadButton
            htmlFor="file-upload"
            isImageUploaded={isImageUploaded}
          >
            사진
          </FileUploadButton>
          <HiddenFileInput
            id="file-upload"
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />
          <Button type="submit">보내기</Button>
        </MessageForm>
      </ChatContainer>
    </ChatLayout>
  );
};

export default ChatRoom;
