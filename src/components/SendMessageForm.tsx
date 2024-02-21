import React, { useState } from "react";
import styled from "styled-components";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #2c2c2c;
  color: white;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  margin-left: 10px;
  border-radius: 20px;
  border: 2px solid white;
  background-color: black;
  color: white;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const AttachFileButton = styled.label`
  padding: 10px;
  color: #1d9bf0;
  border-radius: 20px;
  border: 2px dashed #1d9bf0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const AttachFileInput = styled.input`
  display: none;
`;

const SubmitBtn = styled.button`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 20px 20px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

export default function SendMessageForm() {
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1 && files[0].size <= 1024 * 1024) {
      setFile(files[0]);
    } else if (files && files[0].size > 1024 * 1024) {
      alert("File size should be 1MB or less");
      e.target.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || message.trim() === "") return;

    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, "messages"), {
        text: message,
        createdAt: serverTimestamp(),
        senderId: user.uid,
        username: user.displayName || "Anonymous",
      });

      if (file) {
        const fileRef = ref(storage, `messages/${docRef.id}`);
        const uploadResult = await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(uploadResult.ref);
        await updateDoc(docRef, {
          imageUrl: fileUrl, // 이미지 URL을 문서에 추가
        });
      }
      setMessage("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Input
        type="text"
        onChange={onChange}
        value={message}
        placeholder="Type your message here..."
        required
      />
      <AttachFileButton htmlFor="file">Add photo</AttachFileButton>
      <AttachFileInput
        onChange={onFileChange}
        type="file"
        id="file"
        accept="image/*"
      />
      <SubmitBtn disabled={isLoading}>
        {isLoading ? "Sending..." : "Send"}
      </SubmitBtn>
    </Form>
  );
}
