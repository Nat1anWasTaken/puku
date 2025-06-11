import LoginForm from "@/components/login-form";
import { Flex } from "@chakra-ui/react";

export default function LoginPage() {
  return (
    <Flex width="full" height="full" justifyContent="center" alignItems="center">
      <LoginForm />
    </Flex>
  );
}
