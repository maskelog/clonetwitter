import React from "react";
import styled from "styled-components";
import { auth } from "../firebase";
import { IMessage } from "./MessageList";

type MessageContainerProps = {
  isOwnMessage: boolean;
};

const MessageContainer = styled.div<MessageContainerProps>`
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 10px;
  background-color: ${({ isOwnMessage }) =>
    isOwnMessage ? "#0b93f6" : "#4e4e4e"};
  align-self: ${({ isOwnMessage }) =>
    isOwnMessage ? "flex-end" : "flex-start"};
  max-width: 70%;
`;

const MessageText = styled.span`
  color: white;
  font-size: 16px;
`;

const MessageItem = ({ message }: { message: IMessage }) => {
  const isOwnMessage = message.senderId === auth.currentUser?.uid;

  return (
    <MessageContainer isOwnMessage={isOwnMessage}>
      <MessageText>{message.text}</MessageText>
    </MessageContainer>
  );
};

export default MessageItem;
