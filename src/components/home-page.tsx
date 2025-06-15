import { createClient } from "@/lib/supabase/server";
import { Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { ArrangementCard } from "./arrangement-card";

export async function HomePage() {
  const supabase = await createClient();

  let userId = "";

  const userResult = await supabase.auth.getUser?.();

  if (userResult?.data?.user?.id) {
    userId = userResult.data.user.id;
  }

  let query = supabase.from("arrangements").select("*");

  if (userId) {
    query = query.or('visibility.eq.public,and(visibility.in.("unlisted","private"),owner_id.eq.' + userId + ")");
  } else {
    query = query.eq("visibility", "public");
  }

  const { data: arrangements } = await query;

  return (
    <VStack p={8} gap={4} align="start" w="full">
      <Heading>Puku</Heading>
      <Text>Puku is a platform for sharing and collaborating on musical arrangements.</Text>
      <Flex>{arrangements?.map((arrangement) => <ArrangementCard key={arrangement.id} arrangement={arrangement} />)}</Flex>
    </VStack>
  );
}
