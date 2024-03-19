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
      // Fetch original and quoted tweets
      const tweetsSnapshot = await getDocs(
        query(collection(db, "tweets"), orderBy("createdAt", "desc"), limit(50))
      );
      let allTweets: ITweet[] = [];

      for (const docSnapshot of tweetsSnapshot.docs) {
        let tweetData = docSnapshot.data() as ITweet;
        tweetData.id = docSnapshot.id;
        tweetData.isRetweet = false;

        // Fetch quoted tweet information if available
        if (tweetData.quotedTweetId) {
          const quotedTweetSnap = await getDoc(
            doc(db, "tweets", tweetData.quotedTweetId)
          );
          if (quotedTweetSnap.exists()) {
            tweetData.quotedTweet = {
              id: quotedTweetSnap.id,
              ...(quotedTweetSnap.data() as Omit<ITweet, "id">),
            };
          }
        }

        allTweets.push(tweetData);
      }

      // Fetch retweets
      const retweetsSnapshot = await getDocs(
        query(collection(db, "retweets"), orderBy("createdAt", "desc"))
      );
      for (const retweetDoc of retweetsSnapshot.docs) {
        const retweetData = retweetDoc.data();
        const originalTweetDoc = await getDoc(
          doc(db, "tweets", retweetData.tweetId)
        );

        if (originalTweetDoc.exists()) {
          let originalTweetData = {
            ...(originalTweetDoc.data() as Omit<ITweet, "id">),
            id: originalTweetDoc.id,
            isRetweet: true,
            retweetUsername: retweetData.retweetUsername,
          };

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
        <Tweet
          key={tweet.id}
          {...tweet}
          retweetUsername={tweet.retweetUsername}
        />
      ))}
    </Wrapper>
  );
}
