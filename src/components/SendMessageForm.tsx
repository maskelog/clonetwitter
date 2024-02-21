import React, { useState } from "react";
import styled from "styled-components";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, updateDoc } from "firebase/firestore";
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
    if (!user || isLoading || message === "") return;

    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, "messages"), {
        text: message,
        createdAt: Date.now(),
        senderId: user.uid,
      });
      if (file) {
        const fileRef = ref(storage, `messages/${docRef.id}`);
        const uploadResult = await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(uploadResult.ref);
        await updateDoc(docRef, {
          imageUrl: fileUrl,
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
      <AttachFileButton htmlFor="file">
        <svg
          fill="none"
          strokeWidth={1.5}
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          width="24"
          height="24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      </AttachFileButton>
      <AttachFileInput
        onChange={onFileChange}
        type="file"
        id="file"
        accept="image/*"
      />
      <SubmitBtn type="submit" value={isLoading ? "Sending..." : "Send"} />
    </Form>
  );
}
