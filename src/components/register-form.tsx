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
  createUserWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function RegisterForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuthError = useCallback((error: unknown) => {
    let errorMessage = "Unknown error";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    toaster.error({
      title: "Registration failed",
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

  const handleRegisterWithGoogle = useCallback(async () => {
    await handleAuth(() => signInWithPopup(auth, new GoogleAuthProvider()));
  }, [handleAuth]);

  const handleEmailPasswordRegister = useCallback(async () => {
    // 檢查密碼是否匹配
    if (password !== confirmPassword) {
      toaster.error({
        title: "Registration failed",
        description: "Passwords do not match",
      });
      return;
    }

    await handleAuth(() =>
      createUserWithEmailAndPassword(auth, email, password)
    );
  }, [handleAuth, email, password, confirmPassword]);

  return (
    <Card.Root w="md">
      <Card.Header>
        <Center>
          <Heading>Register</Heading>
        </Center>
        <Text color="fg.subtle" textAlign="center">
          Create your account to get started
        </Text>
      </Card.Header>
      <Card.Body>
        <Button
          w="full"
          onClick={handleRegisterWithGoogle}
          loading={isLoading}
          loadingText="Creating account"
        >
          Register with Google
        </Button>
        <VStack
          mt="4"
          as="form"
          gap="4"
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailPasswordRegister();
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
          <Text w="full" textAlign="left" fontWeight="bold">
            Confirm Password
          </Text>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Please confirm your password"
            required
            w="full"
            size="md"
          />
          <Button
            w="full"
            type="submit"
            colorScheme="blue"
            loading={isLoading}
            loadingText="Creating account"
          >
            Register
          </Button>
        </VStack>
        <Text textAlign="center" mt="4" color="fg.subtle">
          Already have an account? <Link href="/login">Login</Link>
        </Text>
      </Card.Body>
    </Card.Root>
  );
}
