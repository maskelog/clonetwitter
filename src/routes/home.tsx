import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";

const Wrapper = styled.div`
  display: grid;
  gap: 20px;
  overflow-y: auto;
  grid-template-rows: auto auto;
  overflow-x: hidden;
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
    </Wrapper>
  );
}
