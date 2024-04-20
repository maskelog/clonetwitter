import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Tweet, { ITweet } from "../components/tweet";
import defaultAvatar from "../defaultavatar.svg";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  margin: 10px;
`;

const AvatarUpload = styled.label<AvatarUploadProps>`
  cursor: ${(props) => (props.isEditable ? "pointer" : "default")};
  display: inline-block;
  overflow: hidden;
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #ddd;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarInput = styled.input`
  display: none;
`;

const Name = styled.span`
  font-size: 24px;
  font-weight: bold;
`;

const EditInput = styled.input`
  font-size: 20px;
  margin-top: 10px;
`;

const Button = styled.button`
  margin-top: 10px;
  padding: 5px 15px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #ffffff;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const TweetsList = styled.div`
  width: 100%;
`;

interface AvatarUploadProps {
  isEditable: boolean;
}

interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams<{ userId?: string }>();
  const currentUser = auth.currentUser;
  const userId = paramUserId || currentUser?.uid;
  const [avatar, setAvatar] = useState<string>(defaultAvatar);
  const [newUsername, setNewUsername] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 사용자 프로필 및 아바타 가져오기 및 설정
  useEffect(() => {
    const fetchUserProfileAndAvatar = async () => {
      if (userId) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          setNewUsername(userData.displayName || "");

          try {
            const avatarUrl = await getDownloadURL(
              ref(storage, `avatars/${userId}`)
            );
            setAvatar(avatarUrl);
          } catch (error) {
            console.error("Failed to fetch avatar:", error);
            setAvatar(defaultAvatar);
          }
        } else {
          console.error("No such document!");
          // GitHub 로그인 사용자의 데이터가 Firestore에 없을 때 데이터 생성
          if (
            currentUser &&
            currentUser.providerData.some(
              (provider) => provider.providerId === "github.com"
            )
          ) {
            const newUserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || "GitHub User",
              photoURL: currentUser.photoURL || defaultAvatar,
            };
            await setDoc(userRef, newUserProfile); // Firestore에 사용자 데이터 생성
            setAvatar(newUserProfile.photoURL);
            setNewUsername(newUserProfile.displayName);
          } else {
            navigate("/"); // 사용자 데이터가 없고 GitHub 로그인도 아닌 경우 홈으로 리다이렉트
          }
        }
      }
    };

    fetchUserProfileAndAvatar();
  }, [userId, currentUser, navigate]);

  useEffect(() => {
    const fetchTweets = async () => {
      const tweetsRef = query(
        collection(db, "tweets"),
        where("userId", "==", userId || auth.currentUser?.uid),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(tweetsRef);
      const tweetsData = querySnapshot.docs.map((doc) => {
        const { id, ...tweetData } = doc.data() as ITweet;
        return {
          id: doc.id,
          ...tweetData,
        };
      });
      setTweets(tweetsData);
    };

    fetchTweets();
  }, [userId]);

  // 아바타 변경 처리
  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      !file ||
      !auth.currentUser ||
      (userId && userId !== auth.currentUser.uid)
    )
      return;

    const avatarRef = ref(storage, `avatars/${auth.currentUser.uid}`);
    const uploadResult = await uploadBytes(avatarRef, file);
    const avatarUrl = await getDownloadURL(uploadResult.ref);
    await updateProfile(auth.currentUser, { photoURL: avatarUrl });
    setAvatar(avatarUrl);
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { photoURL: avatarUrl });
  };

  // 사용자명 변경 처리
  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewUsername(event.target.value);
  };

  const saveProfile = async () => {
    if (!auth.currentUser) return;

    await updateProfile(auth.currentUser, { displayName: newUsername });
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      displayName: newUsername,
    });

    setIsEditing(false);
  };

  // 채팅 시작 함수
  const startChat = async () => {
    if (!auth.currentUser || !userId) return;

    const chatId = [auth.currentUser.uid, userId].sort().join("-");
    const chatRef = doc(db, "chatRooms", chatId);

    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [auth.currentUser.uid, userId],
        createdAt: serverTimestamp(),
      });
    }

    navigate(`/chat/${chatId}`);
  };

  return (
    <Wrapper>
      <AvatarUpload
        isEditable={userId === auth.currentUser?.uid}
        onClick={() => {
          if (userId === auth.currentUser?.uid) {
            avatarInputRef.current?.click();
          }
        }}
      >
        <img src={avatar} alt="Avatar" />
        {userId === auth.currentUser?.uid && (
          <AvatarInput
            type="file"
            accept="image/*"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        )}
      </AvatarUpload>

      {isEditing ? (
        <>
          <EditInput value={newUsername} onChange={handleUsernameChange} />
          <Button onClick={saveProfile}>Save</Button>
        </>
      ) : (
        <>
          <Name>{newUsername || "Anonymous"}</Name>
          {auth.currentUser?.uid === userId && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </>
      )}
      {userId && userId !== auth.currentUser?.uid && (
        <Button onClick={startChat}>채팅</Button>
      )}
      <TweetsList>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </TweetsList>
    </Wrapper>
  );
};

export default Profile;
