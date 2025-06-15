"use client";

import { Button, Card } from "@chakra-ui/react";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface ArrangementEditButtonProps {
  arrangementId: string;
}

export function ArrangementEditButton({ arrangementId }: ArrangementEditButtonProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/edit/${arrangementId}`);
  };

  return (
    <Card.Root mt={6}>
      <Card.Header>
        <Card.Title>編輯編曲</Card.Title>
      </Card.Header>
      <Card.Body>
        <Button onClick={handleEdit} size="lg" width="full">
          <Edit size={20} />
          編輯編曲
        </Button>
      </Card.Body>
    </Card.Root>
  );
}
