import { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div``;
const Form = styled.form``;
const Input = styled.input``;

export default function CreateAccount(){
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onChage = (e : React.ChangeEvent<HTMLInputElement>) => {
    const {target: {name, value}} = e;
    if(name === "name"){
      setName(value)
    } else if(name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {

    } catch(e) {
      // setError
    }
    finally {
      setLoading(false);
    }
    // create account
    // set the name of the user.
    // redirect to the home page
    console.log(name, email, password);
  }
  
  return (
    <Wrapper>
      <title>Login to 𝕏</title>
      <Form onSubmit={onSubmit}>
        <Input onChange={onChage} name="name" value={name} placeholder="Nmae" type="text" required />
        <Input onChange={onChage} name="email" value={email} placeholder="Email" type="email" required />
        <Input onChange={onChage} name="password" value={password} placeholder="password" type="password" required />
        <Input type="submit" value={isLoading ? "Loading..." : "Create Account"} />
      </Form>
  </Wrapper>
);
}