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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #000;
  color: #fff;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border-radius: 15px;
  border: 2px solid #1d9bf0;
  color: #fff;
  background-color: black;
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
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  margin-left: 8px;

  &:hover {
    opacity: 0.8;
  }

  &.edit,
  &.delete,
  &.menu {
    background-color: #007bff;
    color: white;
  }
`;

const DropdownMenu = styled.div`
  display: none;
  position: absolute;
  background-color: black;
  right: 0;
  top: 30px;
  min-width: 120px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;

  &.show {
    display: block;
  }
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  color: #fff;

  &:hover {
    background-color: #555;
  }

  &.edit {
    background-color: #007bff;
    border-radius: 8px 8px 0 0;
  }

  &.delete {
    background-color: tomato;
    border-radius: 0 0 8px 8px;
  }
`;

export default function Tweet({ id, userId, username, tweet, photo }: ITweet) {
  const user = auth.currentUser;
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTweet, setEditTweet] = useState(tweet);
  const fileInputRef = useRef(null);

  const toggleMenu = () => setShowMenu(!showMenu);

  const onDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete this tweet?");
    if (ok) {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        await deleteObject(storageRef(storage, photo));
      }
    }
  };

  const onEdit = async () => {
    setIsEditing(false);
    await updateDoc(doc(db, "tweets", id), { tweet: editTweet });
  };

  const onImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileRef = storageRef(storage, `tweets/${id}/photo`);
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    await updateDoc(doc(db, "tweets", id), { photo: photoURL });
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {user?.uid === userId && (
          <>
            <Button className="menu" onClick={toggleMenu}>
              ⋮
            </Button>
            <DropdownMenu className={showMenu ? "show" : ""}>
              <MenuItem
                className="edit"
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem className="delete" onClick={onDelete}>
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
          <Button className="edit" onClick={() => fileInputRef.current.click()}>
            Change Photo
          </Button>
          <Button className="edit" onClick={onEdit}>
            Save
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageChange}
            style={{ display: "none" }}
          />
        </>
      ) : (
        <Payload>{tweet}</Payload>
      )}
      {photo && <Photo src={photo} alt="Tweet" />}
    </Wrapper>
  );
}
