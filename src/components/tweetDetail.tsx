import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import firebase from "firebase/compat/app";

interface ITweet {
  id: string;
  username: string;
  tweet: string;
  photo?: string;
  createdAt: firebase.firestore.Timestamp;
}

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

  return (
    <div>
      {tweet ? (
        <div>
          <h2>{tweet.username}</h2>
          <p>{tweet.tweet}</p>
          {tweet.photo && <img src={tweet.photo} alt="Tweet" />}
        </div>
      ) : (
        <p>Tweet not found</p>
      )}
    </div>
  );
};

export default TweetDetail;
