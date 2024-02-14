import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #1b9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  svg {
    width: 50px;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;
const Name = styled.span`
  font-size: 22px;
  color: white;
`;

const NameEditInput = styled.input`
  margin-top: 10px;
  background-color: transparent;
  color: white;
  border-bottom: 2px solid white;
  border-radius: 30px;
  font-size: 22px;
  text-align: center;
  width: 30%;
`;

const UpdateButton = styled.button`
  margin-top: 10px;
  border-radius: 5px;
  background-color: #1d9bf0;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #107cbe;
  }
`;

const ErrorMessage = styled.div`
  color: tomato;
  margin-top: 5px;
`;

const Tweets = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

export default function Profile() {
  const user = auth.currentUser;
  const [avater, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [newUsername, setNewUsername] = useState(user?.displayName ?? "");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const UsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  const updateUsername = async () => {
    if (!user) return;

    if (newUsername.length < 3 || newUsername.length > 16) {
      setUsernameError("Username must be between 3 and 16 characters.");
      return;
    }

    try {
      await updateProfile(user, {
        displayName: newUsername,
      });
      setUsernameError("");
      setIsEditingUsername(false);
      console.log("Username updated successfully.");
    } catch (error) {
      console.error("Error updating username: ", error);
      setUsernameError("Failed to update username.");
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [user]);

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };
  useEffect(() => {
    fetchTweets();
  }, []);
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avater ? (
          <AvatarImg src={avater} />
        ) : (
          <svg
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        )}
        <AvatarImg></AvatarImg>
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      ></AvatarInput>
      <NameContainer>
        {!isEditingUsername ? (
          <>
            <Name>{user?.displayName || "Anonymous"}</Name>
            <UpdateButton onClick={() => setIsEditingUsername(true)}>
              Edit Name
            </UpdateButton>
          </>
        ) : (
          <>
            <NameEditInput
              type="text"
              value={newUsername}
              onChange={UsernameChange}
            />
            <UpdateButton onClick={updateUsername}>Update</UpdateButton>
            {usernameError && <ErrorMessage>{usernameError}</ErrorMessage>}
          </>
        )}
      </NameContainer>
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
