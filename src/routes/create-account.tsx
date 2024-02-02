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
  
  return (
    <Wrapper>
      <Form>
        <Input name="name" placeholder="Nmae" type="text" required />
        <Input name="email" placeholder="Email" type="email" required />
        <Input name="password" placeholder="password" type="password" required />
        <Input name="password" placeholder="password" type="password" required />
        <Input type="submit" value="Create Account" />
      </Form>
  </Wrapper>
);}