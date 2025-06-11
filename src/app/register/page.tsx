"use client";

import RegisterForm from "@/components/register-form";
import { Flex } from "@chakra-ui/react";

export default function RegisterPage() {
  return (
    <Flex w="full" h="full" justify="center" align="center">
      <RegisterForm />
    </Flex>
  );
}
