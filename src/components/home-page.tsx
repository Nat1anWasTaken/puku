import { createClient } from "@/lib/supabase/server";
import { Container, VStack } from "@chakra-ui/react";
import { ArrangementCard } from "./arrangement-card";
import { ArrangementSection } from "./arrangement-section";

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
    <Container maxW="7xl" py={8}>
      <VStack gap={4} align={{ base: "center", md: "start" }} w="full">
        <ArrangementSection title="Public Arrangements">{arrangements?.map((arrangement) => <ArrangementCard key={arrangement.id} arrangement={arrangement} />)}</ArrangementSection>
        <ArrangementSection title="Featured Arrangements">{arrangements?.map((arrangement) => <ArrangementCard key={arrangement.id} arrangement={arrangement} />)}</ArrangementSection>
      </VStack>
    </Container>
  );
}
