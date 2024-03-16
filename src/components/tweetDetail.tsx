import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import styled, { css } from "styled-components";
import { ITweet } from "./tweet";

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
  max-width: 50%;
  border-radius: 8px;
  margin-top: 10px;
`;

const Footer = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
`;

const ShareButton = styled.button`
  border: none;
  background: none;
  color: white;
  cursor: pointer;
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

const BookmarkButton = styled.button`
  border: none;
  background: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  &:hover,
  &:active {
    opacity: 0.8;
  }
`;

const ActionIcon = styled.svg`
  width: 24px;
  height: 24px;
  margin-right: 5px;
`;

const BookmarkIcon = styled(ActionIcon)<{ isBookmarked: boolean }>`
  ${(props) =>
    props.isBookmarked
      ? css`
          fill: #f0b90b;
        `
      : css`
          fill: none;
        `}
`;

const TweetDetail: React.FC = () => {
  const { tweetId } = useParams<{ tweetId?: string }>();
  const [tweet, setTweet] = useState<ITweet | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  useEffect(() => {
    const fetchTweetAndBookmarkStatus = async () => {
      if (!tweetId) return;

      const tweetRef = doc(db, "tweets", tweetId);
      const tweetSnap = await getDoc(tweetRef);
      if (tweetSnap.exists()) {
        const data = tweetSnap.data() as Omit<ITweet, "id">;
        setTweet({ id: tweetSnap.id, ...data });

        // 북마크 상태 확인
        const userUid = auth.currentUser?.uid;
        const bookmarkRef = doc(db, "bookmarks", `${userUid}_${tweetId}`);
        const bookmarkSnap = await getDoc(bookmarkRef);
        setIsBookmarked(bookmarkSnap.exists());
      } else {
        console.log("No such tweet!");
      }
    };

    fetchTweetAndBookmarkStatus();
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

  const toggleBookmark = async () => {
    if (!tweet || !auth.currentUser) return;

    const bookmarkRef = doc(
      db,
      "bookmarks",
      `${auth.currentUser.uid}_${tweet.id}`
    );
    const bookmarkSnap = await getDoc(bookmarkRef);

    if (bookmarkSnap.exists()) {
      // 북마크 제거
      await deleteDoc(bookmarkRef);
      setIsBookmarked(false);
    } else {
      // 북마크 추가
      await setDoc(bookmarkRef, {
        userId: auth.currentUser.uid,
        tweetId: tweet.id,
      });
      setIsBookmarked(true);
    }
  };

  return (
    <Wrapper>
      {tweet ? (
        <>
          <Username>@{tweet.username}</Username>
          <Content>{tweet.tweet}</Content>
          {tweet.photo && <Photo src={tweet.photo} alt="Tweet image" />}
          <Footer>
            <BookmarkButton onClick={toggleBookmark}>
              <BookmarkIcon
                isBookmarked={isBookmarked}
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
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                />
              </BookmarkIcon>
            </BookmarkButton>
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
          </Footer>
        </>
      ) : (
        <Content>Tweet not found</Content>
      )}
    </Wrapper>
  );
};

export default TweetDetail;
