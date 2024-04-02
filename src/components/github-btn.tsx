import { GithubAuthProvider, signInWithRedirect } from "firebase/auth";
import styled from "styled-components";
import { auth } from "../firebase";

const Button = styled.span`
  margin-top: 30px;
  background-color: white;
  width: 100%;
  color: black;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 50px;
  border: 0;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Logo = styled.img`
  height: 25px;
`;

export default function GithubButton() {
  const onClick = () => {
    const provider = new GithubAuthProvider();
    signInWithRedirect(auth, provider);
  };

  return (
    <Button onClick={onClick}>
      <Logo src="/github-logo.svg" />
      Continue with Github
    </Button>
  );
}
