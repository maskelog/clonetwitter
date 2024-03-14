import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import firebase from "firebase/compat/app";
import { styled } from "styled-components";

interface ITweet {
  id: string;
  username: string;
  tweet: string;
  photo?: string;
  createdAt: firebase.firestore.Timestamp;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 20px;
  margin-bottom: 20px;
  background-color: #000;
  color: #fff;
  position: relative;
  padding-bottom: 60px;
`;

const Username = styled.h2`
  font-weight: bold;
  font-size: 16px;
  color: #fff;
  margin-bottom: 10px;
`;

const Content = styled.p`
  font-size: 14px;
  margin-top: 10px;
  color: #fff;
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
  &:hover,
  &:active {
    opacity: 0.8;
  }
`;

const ShareIcon = styled.svg`
  width: 24px;
  height: 24px;
  margin-right: 10px;
`;

const TweetDetail: React.FC = () => {
  const { tweetId } = useParams<{ tweetId: string }>();
  const [tweet, setTweet] = useState<ITweet | null>(null);

  useEffect(() => {
    const fetchTweet = async () => {
      if (tweetId) {
        const tweetRef = doc(db, "tweets", tweetId);
        const tweetSnap = await getDoc(tweetRef);
        if (tweetSnap.exists()) {
          const tweetData = tweetSnap.data() as Omit<ITweet, "id">;
          setTweet({
            id: tweetSnap.id,
            ...tweetData,
            createdAt: tweetData.createdAt,
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
      // 트윗 상세 페이지의 URL을 생성합니다.
      // 이때 `tweet.id`를 사용하여 정확한 트윗의 경로를 지정합니다.
      const tweetUrl = `https://nwitter-reloaded-5757c.firebaseapp.com/tweets/${tweet.id}`;

      // 생성한 URL을 클립보드에 복사합니다.
      await navigator.clipboard.writeText(tweetUrl);
      alert("Tweet link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy tweet link to clipboard.");
    }
  };

  return (
    <Wrapper>
      {tweet ? (
        <>
          <Username>@{tweet.username}</Username>
          <Content>{tweet.tweet}</Content>
          {tweet.photo && <Photo src={tweet.photo} alt="Tweet" />}
        </>
      ) : (
        <Content>Tweet not found</Content>
      )}
      <ShareButton className="share" onClick={handleShare}>
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
    </Wrapper>
  );
};

export default TweetDetail;
