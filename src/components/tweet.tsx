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
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }

  &.edit,
  &.delete {
    background-color: #007bff;
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
    background-color: #007bff;
    border-radius: 8px 8px 0 0;
  }

  &.delete {
    background-color: tomato;
    border-radius: 0 0 8px 8px;
  }
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

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
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
          {/* "Change Photo" 버튼 추가 */}
          <Button
            className="edit"
            onClick={() => fileInputRef.current?.click()}
          >
            Change Photo
          </Button>
          <Button className="edit" onClick={handleEdit}>
            Save
          </Button>
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
    </Wrapper>
  );
}
