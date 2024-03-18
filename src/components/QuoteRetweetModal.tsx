import React, { useState } from "react";
import Modal from "react-modal";
import styled from "styled-components";

const StyledModal = styled(Modal)`
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  margin-right: "-50%";
  transform: "translate(-50%, -50%)";
  max-width: "600px";
  width: "90%";
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 200px;
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

const StyledButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  &:first-child {
    margin-right: 10px;
  }
  &:hover {
    opacity: 0.9;
  }
`;

// Assuming your root element ID is correct. Adjust if necessary.
Modal.setAppElement("#root");

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quote: string) => void;
}

const QuoteRetweetModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [quote, setQuote] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(quote);
    onClose(); // Closing modal after submission
  };

  return (
    <StyledModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Quote Retweet"
    >
      <h2>Quote Retweet</h2>
      <form onSubmit={handleSubmit}>
        <StyledTextArea
          aria-label="Type your quote here"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="What's happening?"
        />
        <div>
          <StyledButton type="submit">Quote Retweet</StyledButton>
          <StyledButton
            type="button"
            onClick={onClose}
            style={{ backgroundColor: "#6c757d" }}
          >
            Cancel
          </StyledButton>
        </div>
      </form>
    </StyledModal>
  );
};

export default QuoteRetweetModal;
