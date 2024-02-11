import React, { useState } from "react";
import styled from "styled-components";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { ITweet } from "./timeline";

// Styled components
const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.div`
  margin: 10px 0px;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  border: none;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const EditButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  border: none;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const Input = styled.input`
  border: 2px solid #1d9bf0;
  padding: 10px;
  border-radius: 15px;
  font-size: 16px;
  color: black;
  background-color: white;
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const SaveButton = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  font-size: 14px;
  padding: 8px 15px;
  border-radius: 15px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #357abd;
  }
`;

export default function Tweet({ id, userId, username, tweet, photo }: ITweet) {
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [editTweet, setEditTweet] = useState(tweet);

  const onDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user?.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onEdit = async () => {
    if (!user || user.uid !== userId || !isEditing) return;
    try {
      await updateDoc(doc(db, "tweets", id), { tweet: editTweet });
      setIsEditing(false); // Exit editing mode
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>
          {isEditing ? (
            <>
              <Input
                type="text"
                value={editTweet}
                onChange={(e) => setEditTweet(e.target.value)}
              />
              <SaveButton onClick={onEdit}>Save</SaveButton>
            </>
          ) : (
            tweet
          )}
        </Payload>
        {user?.uid === userId && !isEditing && (
          <>
            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
            <EditButton onClick={() => setIsEditing(true)}>Edit</EditButton>
          </>
        )}
      </Column>
      <Column>{photo ? <Photo src={photo} alt="Tweet" /> : null}</Column>
    </Wrapper>
  );
}
