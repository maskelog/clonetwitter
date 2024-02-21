import { useParams } from "react-router-dom";
import ChatRoom from "../components/ChatRoom";

const ChatPage = () => {
  let { userId } = useParams();

  return (
    <div>
      <ChatRoom />
    </div>
  );
};

export default ChatPage;
