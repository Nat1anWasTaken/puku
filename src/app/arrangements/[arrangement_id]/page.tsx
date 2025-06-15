import { ArrangementDetailsHeader } from "@/components/details/arrangement-details-header";
import { ArrangementEditButton } from "@/components/details/arrangement-edit-button";
import { ArrangementPartListing } from "@/components/details/arrangement-part-listing";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@chakra-ui/react";

export default async function ArrangementPage({ params }: { params: Promise<{ arrangement_id: string }> }) {
  const { arrangement_id } = await params;

  const supabase = await createClient();

  const { data: arrangement } = await supabase.from("arrangements").select("*").eq("id", arrangement_id).single();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isOwner = user && arrangement && user.id === arrangement.owner_id;

  return (
    <Container maxW="7xl" py={8}>
      <ArrangementDetailsHeader arrangement={arrangement} />
      <ArrangementPartListing arrangementId={arrangement_id} />
      {isOwner && <ArrangementEditButton arrangementId={arrangement_id} />}
    </Container>
  );
}
