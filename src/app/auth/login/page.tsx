import LoginForm from "@/components/login-form";
import { Container, Flex } from "@chakra-ui/react";

export default function LoginPage() {
  return (
    <Container maxW="7xl" py={8}>
      <Flex justifyContent="center">
        <LoginForm />
      </Flex>
    </Container>
  );
}
