import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Tweet, { ITweet } from "./tweet";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

export default function Timeline() {
  const [tweets, setTweets] = useState<ITweet[]>([]);

  useEffect(() => {
    const fetchTweetsAndRetweets = async () => {
      // 원본 및 인용 트윗 가져오기
      let allTweets: ITweet[] = [];
      const tweetsSnapshot = await getDocs(
        query(collection(db, "tweets"), orderBy("createdAt", "desc"), limit(50))
      );

      for (const docSnapshot of tweetsSnapshot.docs) {
        let tweetData: ITweet = {
          ...(docSnapshot.data() as ITweet),
          id: docSnapshot.id,
          isRetweet: false,
        };

        // 인용된 트윗 정보 불러오기
        if (tweetData.quotedTweetId) {
          const quotedTweetSnap = await getDoc(
            doc(db, "tweets", tweetData.quotedTweetId)
          );
          if (quotedTweetSnap.exists()) {
            tweetData.quotedTweet = {
              id: quotedTweetSnap.id,
              ...(quotedTweetSnap.data() as ITweet),
            };
          }
        }

        allTweets.push(tweetData);
      }

      // 리트윗 정보 가져오기
      const retweetsSnapshot = await getDocs(
        query(collection(db, "retweets"), orderBy("createdAt", "desc"))
      );
      for (const retweetDoc of retweetsSnapshot.docs) {
        const retweetData = retweetDoc.data();
        const originalTweetSnap = await getDoc(
          doc(db, "tweets", retweetData.tweetId)
        );

        if (originalTweetSnap.exists()) {
          let originalTweetData: ITweet = {
            ...(originalTweetSnap.data() as ITweet),
            id: originalTweetSnap.id,
            isRetweet: true,
            retweetUsername: retweetData.username,
          };
          allTweets.push(originalTweetData);
        }
      }

      // 시간 순으로 정렬
      allTweets.sort(
        (a, b) =>
          (b.createdAt.seconds ?? b.createdAt) -
          (a.createdAt.seconds ?? a.createdAt)
      );
      setTweets(allTweets);
    };

    fetchTweetsAndRetweets();
  }, []);

  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
}
