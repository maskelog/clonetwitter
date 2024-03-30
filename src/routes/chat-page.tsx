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
  where,
  getDocs,
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
  color: #757575;
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
  color: #757575;
`;

interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

interface Room {
  id: string;
  chatId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
  text: string;
}

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) return;

    const unsubscribe = onSnapshot(
      query(collection(db, "messages"), orderBy("createdAt", "desc")),
      async (snapshot) => {
        const roomsMap: { [key: string]: Room } = {};
        const userInfos: {
          [key: string]: { username: string; avatarUrl: string };
        } = {};

        // 현재 사용자의 채팅방 목록을 가져오기 위한 추가 쿼리
        const chatRoomsQuery = query(
          collection(db, "chatRooms"),
          where("participants", "array-contains", currentUserUid)
        );

        const chatRoomsSnapshot = await getDocs(chatRoomsQuery);
        const userChatRoomIds = chatRoomsSnapshot.docs.map((doc) => doc.id);

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();
          const chatId = data.chatId;

          // 사용자가 참여하고 있는 채팅방만 처리
          if (!userChatRoomIds.includes(chatId)) {
            continue;
          }

          const otherUserId = chatId
            .replace(currentUserUid, "")
            .replace("-", "");

          if (
            !roomsMap[chatId] ||
            roomsMap[chatId].createdAt <
              data.createdAt.toDate().toLocaleString()
          ) {
            if (!userInfos[otherUserId]) {
              try {
                const userSnap = await getDoc(doc(db, "users", otherUserId));
                let username = "Unknown";
                let avatarUrl = defaultAvatar;

                if (userSnap.exists()) {
                  const userProfile = userSnap.data();
                  username = userProfile.displayName || "Unknown";
                  avatarUrl = userProfile.photoURL || defaultAvatar;
                }

                userInfos[otherUserId] = { username, avatarUrl };
              } catch (error) {
                console.error("Error fetching user profile:", error);
              }
            }

            roomsMap[chatId] = {
              id: docSnapshot.id,
              chatId,
              userId: otherUserId,
              username: userInfos[otherUserId].username,
              avatarUrl: userInfos[otherUserId].avatarUrl,
              createdAt: data.createdAt.toDate().toLocaleString(),
              text: data.text,
            };
          }
        }

        setRooms(
          Object.values(roomsMap).sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt)
          )
        );
      }
    );

    return () => unsubscribe();
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
