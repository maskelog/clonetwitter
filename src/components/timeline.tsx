import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Tweet, { ITweet } from "./tweet";
import { Unsubscribe } from "firebase/auth";

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;
export default function Timeline() {
  const [tweets, setTweets] = useState<ITweet[]>([]);

  useEffect(() => {
    const fetchTweets = () => {
      const tweetsQuery = query(
        collection(db, "tweets"),
        orderBy("createdAt", "desc"),
        limit(25)
      );

      const unsubscribe = onSnapshot(tweetsQuery, async (snapshot) => {
        const tweetsData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            let quotedTweetData = null;

            // 인용된 트윗 ID가 있는 경우 해당 트윗의 데이터를 가져옵니다.
            if (data.quotedTweetId) {
              const quotedTweetSnap = await getDoc(
                doc(db, "tweets", data.quotedTweetId)
              );
              if (quotedTweetSnap.exists()) {
                quotedTweetData = {
                  id: quotedTweetSnap.id,
                  ...quotedTweetSnap.data(),
                };
              }
            }

            return {
              ...data,
              id: docSnapshot.id,
              quotedTweet: quotedTweetData, // 인용된 트윗 데이터를 추가합니다.
            };
          })
        );

        setTweets(tweetsData);
      });

      return unsubscribe; // 클린업 함수에서 사용할 수 있도록 unsubscribe 함수를 반환합니다.
    };

    const unsubscribe = fetchTweets();

    // 컴포넌트가 언마운트될 때 unsubscribe 함수를 호출하여 리스너를 해제합니다.
    return () => unsubscribe();
  }, []);

  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
}
