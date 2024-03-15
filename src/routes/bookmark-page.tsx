import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Tweet, { ITweet } from "../components/tweet"; // ITweet 인터페이스 임포트 위치 확인

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BookmarkPage: React.FC = () => {
  const [bookmarkedTweets, setBookmarkedTweets] = useState<ITweet[]>([]);
  // 현재 로그인한 사용자의 ID 사용
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchBookmarkedTweets = async () => {
      const bookmarksQuery = query(
        collection(db, "bookmarks"),
        where("userId", "==", userId)
      );
      const bookmarkSnapshots = await getDocs(bookmarksQuery);

      const tweetsPromises = bookmarkSnapshots.docs.map(async (bookmarkDoc) => {
        const tweetId = bookmarkDoc.data().tweetId;
        const tweetRef = doc(db, "tweets", tweetId);
        const tweetSnapshot = await getDoc(tweetRef);
        if (tweetSnapshot.exists()) {
          return {
            id: tweetSnapshot.id,
            ...(tweetSnapshot.data() as Omit<ITweet, "id">),
          };
        }
        return null;
      });

      const tweets = (await Promise.all(tweetsPromises)).filter(
        (tweet): tweet is ITweet => !!tweet
      );
      setBookmarkedTweets(tweets);
    };

    if (userId) {
      fetchBookmarkedTweets();
    }
  }, [userId]);

  return (
    <Wrapper>
      {bookmarkedTweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
};

export default BookmarkPage;
