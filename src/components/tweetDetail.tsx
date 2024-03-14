import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import styled from "styled-components";
import firebase from "firebase/compat/app";

interface ITweet {
  id: string;
  username: string;
  tweet: string;
  photo?: string;
  createdAt: firebase.firestore.Timestamp;
}

interface WrapperProps {
  hasPhoto: boolean;
  isSingleLine: boolean;
}

const Wrapper = styled.div<WrapperProps>`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 20px;
  margin-bottom: 20px;
  background-color: #000;
  color: #fff;
  position: relative;
  min-height: ${({ isSingleLine, hasPhoto }) =>
    isSingleLine && !hasPhoto ? "100px" : "auto"};
  min-width: 300px;
  max-width: 600px;
  box-sizing: border-box;
`;

const Username = styled.h2`
  font-weight: bold;
  font-size: 16px;
  color: #fff;
  margin-bottom: 10px;
`;

const Content = styled.p`
  font-size: 14px;
  color: #fff;
  margin: 10px 0;
`;

const Photo = styled.img`
  max-width: 100%;
  border-radius: 8px;
  margin-top: 10px;
`;

const ShareButton = styled.button`
  border: none;
  background: none;
  color: white;
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 5px;
  display: flex;
  align-items: center;
  &:hover,
  &:active {
    opacity: 0.8;
  }
`;

const ShareIcon = styled.svg`
  width: 24px;
  height: 24px;
  margin-right: 5px;
`;

const TweetDetail: React.FC = () => {
  const { tweetId } = useParams<{ tweetId?: string }>();
  const [tweet, setTweet] = useState<ITweet | null>(null);

  useEffect(() => {
    const fetchTweet = async () => {
      if (tweetId) {
        const tweetRef = doc(db, "tweets", tweetId);
        const tweetSnap = await getDoc(tweetRef);
        if (tweetSnap.exists()) {
          const data = tweetSnap.data() as Omit<ITweet, "id">;
          setTweet({
            id: tweetSnap.id,
            ...data,
          });
        } else {
          console.log("No such tweet!");
        }
      }
    };

    fetchTweet();
  }, [tweetId]);

  const handleShare = async () => {
    if (!tweet) {
      console.error("There's no tweet to share.");
      return;
    }

    try {
      const tweetUrl = `https://nwitter-reloaded-5757c.firebaseapp.com/tweets/${tweet.id}`;
      await navigator.clipboard.writeText(tweetUrl);
      alert("Tweet link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy tweet link to clipboard.");
    }
  };

  const isSingleLine = (tweet?.tweet.length ?? 0) < 100;
  const hasPhoto = !!tweet?.photo;

  return (
    <Wrapper hasPhoto={hasPhoto} isSingleLine={isSingleLine}>
      {tweet ? (
        <>
          <Username>@{tweet.username}</Username>
          <Content>{tweet.tweet}</Content>
          {tweet.photo && <Photo src={tweet.photo} alt="Tweet image" />}
          <ShareButton onClick={handleShare}>
            <ShareIcon
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
                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
              />
            </ShareIcon>
          </ShareButton>
        </>
      ) : (
        <Content>Tweet not found</Content>
      )}
    </Wrapper>
  );
};

export default TweetDetail;
