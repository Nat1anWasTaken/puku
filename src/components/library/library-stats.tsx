"use client";

import { Card, Grid, Heading, Text, VStack } from "@chakra-ui/react";
import { Arrangement } from "./library-arrangement-card";

interface LibraryStatsProps {
  arrangements: Arrangement[];
}

export function LibraryStats({ arrangements }: LibraryStatsProps) {
  const publicCount = arrangements.filter((arr) => arr.visibility === "public").length;
  const privateCount = arrangements.filter((arr) => arr.visibility === "private").length;

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} w="full">
      <Card.Root>
        <Card.Body>
          <VStack align="start" gap={1}>
            <Text color="fg.muted" fontSize="sm">
              總編曲數
            </Text>
            <Heading size="lg">{arrangements.length}</Heading>
          </VStack>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Body>
          <VStack align="start" gap={1}>
            <Text color="fg.muted" fontSize="sm">
              公開編曲
            </Text>
            <Heading size="lg">{publicCount}</Heading>
          </VStack>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Body>
          <VStack align="start" gap={1}>
            <Text color="fg.muted" fontSize="sm">
              私人編曲
            </Text>
            <Heading size="lg">{privateCount}</Heading>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Grid>
  );
}
