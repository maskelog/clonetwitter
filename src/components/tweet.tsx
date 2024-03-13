import React, { useState, useRef } from "react";
import styled from "styled-components";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { ITweet } from "./timeline";
import { useNavigate } from "react-router-dom";

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
  display: flex;
  justify-content: space-between;
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

export default function Tweet({ id, userId, username, tweet, photo }: ITweet) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTweet, setEditTweet] = useState(tweet);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Event Handlers
  const handleMenuToggle = () => setShowMenu(!showMenu);
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

  const navigate = useNavigate();

  const handleUsernameClick = () => {
    // 사용자 ID로 프로필 페이지로 이동
    navigate(`/profile/${userId}`);
  };

  const handleShare = async () => {
    try {
      const tweetUrl = `https://nwitter-reloaded-5757c.firebaseapp.com/tweets/${id}`;

      await navigator.clipboard.writeText(tweetUrl);
      alert("Tweet link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy tweet link to clipboard.");
    }
  };

  return (
    <Wrapper>
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
}
