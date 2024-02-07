import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import {
  Form,
  Error,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || email === "") {
      setError("Please fill in your email.");
      return;
    }
    setError("");
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert("A password reset email has been sent to your email address.");
      navigate("/login");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Reset Password</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Sending..." : "Send Reset Email"}
        />
      </Form>
      {error !== "" && <Error>{error}</Error>}
      <Switcher>
        <Link to="/login">Back to Login</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
