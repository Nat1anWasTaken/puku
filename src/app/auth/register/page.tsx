"use client";

import RegisterForm from "@/components/register-form";
import { Container, Flex } from "@chakra-ui/react";

export default function RegisterPage() {
  return (
    <Container maxW="7xl" py={8}>
      <Flex justify="center">
        <RegisterForm />
      </Flex>
    </Container>
  );
}
