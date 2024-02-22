import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import ChatRoom from "../components/ChatRoom";

const ChatPageLayout = styled.div`
  display: flex;
  height: 100vh;
`;

const ChatPage = () => {
  const { userID } = useParams();
  const [selectedUserId, setSelectedUserId] = useState(userID);

  useEffect(() => {
    setSelectedUserId(userID);
  }, [userID]);

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <ChatPageLayout>
      {selectedUserId ? (
        <ChatRoom userId={selectedUserId} />
      ) : (
        <div>채팅을 시작하려면 사용자를 선택하세요.</div>
      )}
    </ChatPageLayout>
  );
};

export default ChatPage;
