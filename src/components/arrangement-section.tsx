import { Flex, Heading, Separator, VStack } from "@chakra-ui/react";

interface ArrangementSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ArrangementSection({ title, children }: ArrangementSectionProps) {
  return (
    <VStack gap={2} w="full" align="stretch">
      <Heading>{title}</Heading>
      <Flex direction={{ base: "column", md: "row" }} align={{ base: "center", md: "start" }} gap={2} w="full" flexWrap="wrap">
        {children}
      </Flex>
      <Separator mt={4} />
    </VStack>
  );
}
