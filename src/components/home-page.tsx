import { createClient } from "@/lib/supabase/server";
import { Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { ArrangementCard } from "./arrangement-card";

export async function HomePage() {
  const supabase = await createClient();

  const { data: arrangements } = await supabase.from("arrangements").select("*");

  return (
    <VStack p={8} gap={4} align="start" w="full">
      <Heading>Puku</Heading>
      <Text>Puku is a platform for sharing and collaborating on musical arrangements.</Text>
      <Flex>{arrangements?.map((arrangement) => <ArrangementCard key={arrangement.id} arrangement={arrangement} />)}</Flex>
    </VStack>
  );
}
