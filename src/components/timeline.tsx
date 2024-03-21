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
      let allTweets: ITweet[] = [];

      const tweetsSnapshot = await getDocs(
        query(collection(db, "tweets"), orderBy("createdAt", "desc"), limit(50))
      );

      const quotedTweetsPromises = tweetsSnapshot.docs.map(
        async (docSnapshot) => {
          const tweetData = {
            ...docSnapshot.data(),
            id: docSnapshot.id,
          } as ITweet;

          if (tweetData.quotedTweetId) {
            const quotedTweetDoc = await getDoc(
              doc(db, "tweets", tweetData.quotedTweetId)
            );

            if (quotedTweetDoc.exists()) {
              const quotedTweetData = {
                ...quotedTweetDoc.data(),
                id: quotedTweetDoc.id,
              } as ITweet;
              tweetData.quotedTweet = quotedTweetData;
            }
          }

          return tweetData;
        }
      );

      const originalTweets = await Promise.all(quotedTweetsPromises);
      allTweets.push(...originalTweets);

      const retweetsSnapshot = await getDocs(
        query(collection(db, "retweets"), orderBy("createdAt", "desc"))
      );

      for (const docSnapshot of retweetsSnapshot.docs) {
        const retweetData = docSnapshot.data();
        const originalTweetDoc = await getDoc(
          doc(db, "tweets", retweetData.tweetId)
        );

        if (originalTweetDoc.exists()) {
          const originalTweetData = {
            ...originalTweetDoc.data(),
            id: originalTweetDoc.id,
            createdAt: retweetData.createdAt,
            isRetweet: true,
            retweetUsername: retweetData.retweetUsername,
          } as ITweet;

          allTweets.push(originalTweetData);
        }
      }

      allTweets.sort((a, b) => b.createdAt - a.createdAt);

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
