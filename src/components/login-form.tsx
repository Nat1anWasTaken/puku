"use client";

import { toaster } from "@/components/ui/toaster";
import { auth } from "@/lib/firebase";
import {
  Text,
  Button,
  Card,
  Center,
  Heading,
  VStack,
  Input,
  Link,
} from "@chakra-ui/react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function LoginForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuthError = useCallback((error: unknown) => {
    let errorMessage = "Unknown error";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    toaster.error({
      title: "Login failed",
      description: errorMessage,
    });
  }, []);

  const handleAuth = useCallback(
    async (authFunction: () => Promise<UserCredential>) => {
      setIsLoading(true);
      try {
        await authFunction();
        router.push("/");
      } catch (error) {
        handleAuthError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [router, handleAuthError]
  );

  const handleLoginWithGoogle = useCallback(async () => {
    await handleAuth(() => signInWithPopup(auth, new GoogleAuthProvider()));
  }, [handleAuth]);

  const handleEmailPasswordLogin = useCallback(async () => {
    await handleAuth(() => signInWithEmailAndPassword(auth, email, password));
  }, [handleAuth, email, password]);

  return (
    <Card.Root w="md">
      <Card.Header>
        <Center>
          <Heading>Login</Heading>
        </Center>
        <Text color="fg.subtle" textAlign="center">
          Login to your account to continue
        </Text>
      </Card.Header>
      <Card.Body>
        <Button
          w="full"
          onClick={handleLoginWithGoogle}
          loading={isLoading}
          loadingText="Logging in"
        >
          Login with Google
        </Button>
        <VStack
          mt="4"
          as="form"
          gap="4"
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailPasswordLogin();
          }}
        >
          <Text w="full" textAlign="left" fontWeight="bold">
            Email
          </Text>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Please enter your email"
            required
            w="full"
            size="md"
          />
          <Text w="full" textAlign="left" fontWeight="bold">
            Password
          </Text>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Please enter your password"
            required
            w="full"
            size="md"
          />
          <Button
            w="full"
            type="submit"
            colorScheme="blue"
            loading={isLoading}
            loadingText="Logging in"
          >
            Login
          </Button>
        </VStack>
        <Text textAlign="center" mt="4" color="fg.subtle">
          Don&apos;t have an account? <Link href="/register">Register</Link>
        </Text>
      </Card.Body>
    </Card.Root>
  );
}
