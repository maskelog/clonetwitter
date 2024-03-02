import { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import defaultAvatar from "../defaultavatar.svg";
import ChatRoom from "../components/ChatRoom";

const ChatPageLayout = styled.div`
  display: flex;
  height: 100vh;
`;

const ChatRoomsList = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  max-height: 80%;
  border-right: 1px solid #ccc;
  font-size: 20px;
`;

const ChatRoomContainer = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const RoomLink = styled(Link)`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.3s;
  border-radius: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background-color: #f0f0f0;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const RoomContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const RoomDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #666;
`;

interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [rooms, setRooms] = useState([]);
  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchRooms = async () => {
      const messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const roomsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            const chatIdParts = data.chatId.split("-");
            const otherUserId = chatIdParts.find((id) => id !== currentUserUid);

            let avatarUrl = defaultAvatar;
            let username = "Unknown";
            if (otherUserId) {
              const userRef = doc(db, "users", otherUserId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userProfile = userSnap.data();
                username = userProfile.name || "Unknown";
                try {
                  avatarUrl = await getDownloadURL(
                    ref(storage, `avatars/${otherUserId}`)
                  );
                } catch (error) {
                  console.error("Error fetching avatar:", error);
                  avatarUrl = defaultAvatar;
                }
              }
            }

            return {
              id: docSnapshot.id,
              chatId: data.chatId,
              userId: otherUserId,
              username,
              avatarUrl,
              createdAt: data.createdAt.toDate().toLocaleString(),
              text: data.text,
            };
          })
        );

        setRooms(roomsData);
      });

      return () => unsubscribe();
    };

    fetchRooms();
  }, [currentUserUid]);

  return (
    <ChatPageLayout>
      {!roomId && (
        <ChatRoomsList>
          {rooms.map((room) => (
            <RoomLink key={room.id} to={`/chat/${room.chatId}`}>
              <Avatar src={room.avatarUrl} alt="Avatar" />
              <RoomContent>
                <RoomDetails>
                  <div>{room.username || "Unknown"}</div>
                  <div>{room.text || "No messages yet"}</div>
                </RoomDetails>
                <Timestamp>{room.createdAt}</Timestamp>
              </RoomContent>
            </RoomLink>
          ))}
        </ChatRoomsList>
      )}
      {roomId && (
        <ChatRoomContainer>
          <ChatRoom userId={roomId} />
        </ChatRoomContainer>
      )}
    </ChatPageLayout>
  );
}
