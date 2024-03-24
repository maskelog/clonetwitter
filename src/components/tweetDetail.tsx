import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import styled, { css } from "styled-components";
import { ITweet } from "./tweet";
import QuoteRetweetModal from "./QuoteRetweetModal";

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
  line-height: 120%;
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

const RetweetButton = styled.button`
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

const RetweetIcon = styled.svg`
  width: 24px;
  height: 24px;
  margin-right: 5px;
`;

const RetweetOptions = styled.div`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  top: 100%;
  right: 0;
  z-index: 2;
`;

const RetweetOptionButton = styled.button`
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin: 4px 0;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e2e2e2;
  }

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const TweetDetail: React.FC = () => {
  const { tweetId } = useParams<{ tweetId?: string }>();
  const [tweet, setTweet] = useState<ITweet | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showRetweetOptions, setShowRetweetOptions] = useState(false);
  const [isRetweetModalOpen, setIsRetweetModalOpen] = useState(false);

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

  const handleRetweet = async (type: "retweet" | "quote") => {
    if (!tweet || !auth.currentUser) {
      console.error("You must be logged in to retweet or quote retweet.");
      return;
    }

    if (type === "quote") {
      setIsRetweetModalOpen(true); // 인용 리트윗 모달 열기
    } else {
      // 단순 리트윗 로직 실행
      try {
        await addDoc(collection(db, "retweets"), {
          userId: auth.currentUser.uid,
          tweetId: tweet.id,
          createdAt: Date.now(),
          retweetUsername: auth.currentUser.displayName || "Anonymous",
        });
        alert("Retweet successful!");
      } catch (err) {
        console.error("Failed to retweet: ", err);
        alert("Failed to retweet. Please try again later.");
      }
    }
  };

  const handleQuoteRetweet = async (quote: string) => {
    // 인용 리트윗 로직 (인용 내용을 포함한 새 트윗 추가)
    const user = auth.currentUser;
    if (!tweet || !auth.currentUser) return;
    try {
      await addDoc(collection(db, "tweets"), {
        userId: auth.currentUser.uid,
        tweet: quote,
        quotedTweetId: tweet.id,
        createdAt: Date.now(),
        username: user?.displayName || "Anonymous",
      });
      alert("Quote retweeted successfully!");
    } catch (err) {
      console.error("Failed to quote retweet: ", err);
      alert("Failed to quote retweet. Please try again.");
    } finally {
      setIsRetweetModalOpen(false); // 모달 닫기
    }
  };

  const toggleRetweetOptions = () => setShowRetweetOptions(!showRetweetOptions);

  return (
    <Wrapper>
      {tweet ? (
        <>
          <Username>@{tweet.username}</Username>
          <Content>{tweet.tweet}</Content>
          {tweet.photo && <Photo src={tweet.photo} alt="Tweet image" />}
          <Footer>
            <RetweetButton className="retweet" onClick={toggleRetweetOptions}>
              <RetweetIcon
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
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                />
              </RetweetIcon>
            </RetweetButton>
            {showRetweetOptions && (
              <RetweetOptions>
                <RetweetOptionButton onClick={() => handleRetweet("retweet")}>
                  재게시
                </RetweetOptionButton>
                <RetweetOptionButton onClick={() => handleRetweet("quote")}>
                  인용
                </RetweetOptionButton>
              </RetweetOptions>
            )}
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

            {isRetweetModalOpen && (
              <QuoteRetweetModal
                isOpen={isRetweetModalOpen}
                onClose={() => setIsRetweetModalOpen(false)}
                onSubmit={handleQuoteRetweet}
              />
            )}
          </Footer>
        </>
      ) : (
        <Content>Tweet not found</Content>
      )}
    </Wrapper>
  );
};

export default TweetDetail;
