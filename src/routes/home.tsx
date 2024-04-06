import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";
import TweetDetail from "../components/tweetDetail";
import Profile from "./profile";
import ChatPage from "./chat-page";
import BookmarkPage from "./bookmark-page";

const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  overflow-y: auto;
  grid-template-rows: auto auto;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

export default function Home() {
  return (
    <Wrapper>
      <PostTweetForm />
      <Timeline />
      <TweetDetail />
      <Profile />
      <ChatPage />
      <BookmarkPage />
    </Wrapper>
  );
}
