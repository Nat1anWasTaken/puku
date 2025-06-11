"use client";

import LoginForm from "@/components/login-form";
import { Flex } from "@chakra-ui/react";

export default function LoginPage() {
  return (
    <Flex w="full" h="full" justify="center" align="center">
      <LoginForm />
    </Flex>
  );
}
