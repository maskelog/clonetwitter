import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import ChatMessage from "../components/ChatMessage";

interface IMessage {
  id: string;
  text: string;
  sentBy: string;
  createdAt?: any;
}

const ChatRoom = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 채팅방의 메시지를 실시간으로 불러오는 로직
  }, [userId]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 메시지 전송 로직
  };

  return (
    <div>
      {/* 채팅 UI 구성 */}
      <form onSubmit={sendMessage}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;
