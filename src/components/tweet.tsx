import React, { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import QuoteRetweetModal from "./QuoteRetweetModal";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 20px;
  margin-bottom: 5px;
  background-color: #000;
  color: #fff;
  position: relative;
  padding-bottom: 60px;
  line-height: 120%;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border-radius: 20px;
  border: 2px solid #fff;
  color: #fff;
  background: transparent;
  font-size: 14px;
  height: 100px;
  resize: vertical;
  margin-bottom: 10px;
  width: 100%;
`;

const Column = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const Photo = styled.img`
  max-width: 100px;
  border-radius: 8px;
  margin-top: 10px;
`;

const Username = styled.span`
  font-weight: bold;
  font-size: 16px;
  color: #fff;
`;

const Payload = styled.p`
  font-size: 14px;
  margin-top: 10px;
  color: #fff;
`;

const Button = styled.button`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 10px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }

  &.edit,
  &.delete {
    background-color: #1d9bf0;
    color: white;
  }

  &.delete {
    background-color: tomato;
  }

  &.menu {
    background: transparent;
    color: #ffffff;
    font-size: 16px;
  }
`;

const DropdownMenu = styled.div<{ show: boolean }>`
  position: absolute;
  background-color: black;
  right: 0;
  top: 30px;
  min-width: 120px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  display: ${({ show }) => (show ? "block" : "none")};
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  color: #fff;

  &:hover {
    background-color: #555;
  }

  &.edit {
    background-color: #1d9bf0;
    border-radius: 8px 8px 0 0;
  }

  &.delete {
    background-color: tomato;
    border-radius: 0 0 8px 8px;
  }
`;

const ButtonsContainer = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
`;

const ActionButton = styled.button`
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

  & + & {
    margin-left: 5px;
  }
`;

const ActionIcon = styled.svg`
  width: 24px;
  height: 24px;
  margin-right: 5px;
`;

const RetweetIcon = styled.svg`
  width: 24px;
  height: 24px;
  margin-right: 5px;
`;

const LikeIcon = styled(ActionIcon)<LikeIconProps>`
  ${(props) =>
    props.isLiked
      ? css`
          fill: #f00b0b;
        `
      : css`
          fill: none;
        `}
`;

const BookmarkIcon = styled(ActionIcon)<BookmarkIconProps>`
  ${(props) =>
    props.isBookmarked
      ? css`
          fill: #f0b90b;
        `
      : css`
          fill: none;
        `}
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

const QuotedTweet = styled.div`
  border-left: 2px solid #ccc;
  padding-left: 10px;
  margin-top: 10px;
`;

export interface ITweet {
  id: string;
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
  photo?: string;
  isBookmarked?: boolean;
  quotedTweetId?: string;
  quotedTweet?: ITweet | null;
  isRetweet?: boolean;
  retweetUsername?: string;
}

interface BookmarkIconProps {
  isBookmarked: boolean;
}

interface LikeIconProps {
  isLiked: boolean;
}
const Tweet: React.FC<ITweet> = ({
  id,
  userId,
  username,
  tweet,
  photo,
  isBookmarked,
  quotedTweet,
  isRetweet,
  retweetUsername,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTweet, setEditTweet] = useState(tweet);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isRetweetModalOpen, setIsRetweetModalOpen] = useState(false);
  const [showRetweetOptions, setShowRetweetOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      const userUid = auth.currentUser?.uid;
      if (userUid) {
        const bookmarkRef = doc(db, "bookmarks", `${userUid}_${id}`);
        const bookmarkSnap = await getDoc(bookmarkRef);
        setBookmarked(bookmarkSnap.exists());
      }
    };

    checkBookmarkStatus();
  }, [id]);

  // 리트윗 옵션 토글
  const toggleRetweetOptions = () => setShowRetweetOptions(!showRetweetOptions);

  // 리트윗 실행
  const handleRetweet = async (type: "retweet" | "quote") => {
    const user = auth.currentUser;
    if (!user) {
      alert("You need to be logged in to retweet or quote retweet.");
      return;
    }

    if (type === "quote") {
      // 인용 리트윗 모달 열기
      setIsRetweetModalOpen(true);
    } else {
      // 단순 리트윗 로직 실행
      try {
        await addDoc(collection(db, "retweets"), {
          userId: user.uid,
          tweetId: id,
          createdAt: Date.now(),
          // 현재 로그인한 사용자의 displayName을 retweetUsername 필드로 추가
          retweetUsername: user.displayName || "Anonymous",
        });
        alert("Retweet successful!");
      } catch (error) {
        console.error("Failed to retweet: ", error);
        alert("Failed to retweet. Please try again later.");
      }
    }
  };

  const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // 상위 요소로의 이벤트 전파 방지
    setShowMenu((prevShowMenu) => !prevShowMenu); // 상태 토글
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this tweet?")) {
      await deleteDoc(doc(db, "tweets", id));
      photo && (await deleteObject(storageRef(storage, photo)));
    }
  };

  const handleEdit = async () => {
    await updateDoc(doc(db, "tweets", id), { tweet: editTweet });
    isEditing && fileInputRef.current?.click();
    setIsEditing(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileRef = storageRef(storage, `tweets/${id}/photo`);
      const uploadResult = await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(uploadResult.ref);
      await updateDoc(doc(db, "tweets", id), { photo: photoURL });
    }
  };

  const handleUsernameClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    // 사용자 ID로 프로필 페이지로 이동
    event.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  const handleTweetClick = () => {
    navigate(`/tweets/${id}`); // 트윗 상세 페이지로 이동
  };

  const handleShare = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      const tweetUrl = `https://nwitter-reloaded-5757c.firebaseapp.com/tweets/${id}`;

      await navigator.clipboard.writeText(tweetUrl);
      alert("Tweet link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy tweet link to clipboard.");
    }
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleBookmarkToggle = async () => {
    try {
      const userUid = auth.currentUser?.uid;
      if (!userUid) {
        console.error("User is not logged in");
        return;
      }

      const bookmarkRef = doc(db, "bookmarks", `${userUid}_${id}`);
      const bookmarkSnap = await getDoc(bookmarkRef);

      if (bookmarkSnap.exists()) {
        await deleteDoc(bookmarkRef);
        setBookmarked(false); // 북마크 제거 시 상태 업데이트
      } else {
        await setDoc(bookmarkRef, { userId: userUid, tweetId: id });
        setBookmarked(true); // 북마크 추가 시 상태 업데이트
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const handleQuoteRetweet = async (quote: string) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to quote retweet.");
      return;
    }

    try {
      await addDoc(collection(db, "tweets"), {
        userId: user.uid,
        tweet: quote,
        quotedTweetId: id,
        username: user.displayName || "Anonymous",
        createdAt: Date.now(),
      });
      alert("Quote retweeted successfully");
    } catch (error) {
      console.error("Error quote retweeting: ", error);
      alert("Failed to quote retweet. Please try again.");
    } finally {
      setIsRetweetModalOpen(false);
    }
  };

  //좋아요
  useEffect(() => {
    const fetchLikeStatus = async () => {
      const userUid = auth.currentUser?.uid;
      if (userUid) {
        // 현재 사용자가 좋아요를 눌렀는지 확인
        const likeRef = doc(db, "likes", `${id}_${userUid}`);
        const likeSnap = await getDoc(likeRef);
        setLiked(likeSnap.exists());
      }
      // 총 좋아요 수 확인
      const likeCountRef = collection(db, "likes");
      const q = query(likeCountRef, where("tweetId", "==", id));
      const querySnapshot = await getDocs(q);
      setLikeCount(querySnapshot.docs.length);
    };

    fetchLikeStatus();
  }, [id]);

  const handleLikeToggle = async () => {
    const userUid = auth.currentUser?.uid;
    if (!userUid) return;

    const likeRef = doc(db, "likes", `${id}_${userUid}`);
    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      // 좋아요 제거
      await deleteDoc(likeRef);
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      // 좋아요 추가
      await setDoc(likeRef, { userId: userUid, tweetId: id });
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  return (
    <Wrapper onClick={handleTweetClick}>
      <Column>
        <Username onClick={handleUsernameClick}>{username}</Username>
        {auth.currentUser?.uid === userId && (
          <>
            <Button className="menu" onClick={handleMenuToggle}>
              ⋮
            </Button>
            <DropdownMenu show={showMenu}>
              <MenuItem className="edit" onClick={() => setIsEditing(true)}>
                Edit
              </MenuItem>
              <MenuItem className="delete" onClick={handleDelete}>
                Delete
              </MenuItem>
            </DropdownMenu>
          </>
        )}
      </Column>
      {isEditing ? (
        <>
          <TextArea
            value={editTweet}
            onChange={(e) => setEditTweet(e.target.value)}
          />
          <ButtonsContainer>
            <Button
              className="edit"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </Button>
            <Button className="edit" onClick={handleEdit}>
              Save
            </Button>
          </ButtonsContainer>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </>
      ) : (
        <Payload>{tweet}</Payload>
      )}
      {photo && (
        <Photo
          src={photo}
          alt="Tweet"
          onClick={() => window.open(photo, "_blank")}
        />
      )}
      {quotedTweet && (
        <QuotedTweet>
          <Tweet {...quotedTweet} />
        </QuotedTweet>
      )}
      {isRetweet && (
        <QuotedTweet>재게시됨 @ {retweetUsername || "알 수 없음"}</QuotedTweet>
      )}
      <ButtonsContainer onClick={handleButtonClick}>
        <ActionButton className="retweet" onClick={toggleRetweetOptions}>
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
        </ActionButton>
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

        {isRetweetModalOpen && (
          <QuoteRetweetModal
            isOpen={isRetweetModalOpen}
            onClose={() => setIsRetweetModalOpen(false)}
            onSubmit={handleQuoteRetweet}
          />
        )}

        <ActionButton
          className="Bookmark"
          onClick={(event) => {
            event.stopPropagation();
            handleBookmarkToggle();
          }}
        >
          <BookmarkIcon
            isBookmarked={bookmarked ?? false}
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
        </ActionButton>

        <ActionButton
          className="Liked"
          onClick={(event) => {
            event.stopPropagation();
            handleLikeToggle();
          }}
        >
          <LikeIcon
            isLiked={liked ?? false}
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </LikeIcon>
        </ActionButton>
        <ActionButton className="share" onClick={handleShare}>
          <ActionIcon
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
          </ActionIcon>
        </ActionButton>
      </ButtonsContainer>
    </Wrapper>
  );
};

export default Tweet;
