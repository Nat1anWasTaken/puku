"use client";

import { useEffect, useState } from "react";
import { HStack, Text, Spinner } from "@chakra-ui/react";
import { Check, Clock } from "lucide-react";

interface AutoSaveIndicatorProps {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export function AutoSaveIndicator({ isAutoSaving, lastSaved, hasUnsavedChanges }: AutoSaveIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return "剛剛";
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} 分鐘前`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours} 小時前`;
    }
  };

  if (isAutoSaving) {
    return (
      <HStack gap={2} color="blue.600">
        <Spinner size="sm" />
        <Text fontSize="sm">正在保存草稿...</Text>
      </HStack>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <HStack gap={2} color="orange.600">
        <Clock size={16} />
        <Text fontSize="sm">有未保存的更改</Text>
      </HStack>
    );
  }

  if (lastSaved) {
    return (
      <HStack gap={2} color="green.600">
        <Check size={16} />
        <Text fontSize="sm">草稿已保存 · {getTimeAgo(lastSaved)}</Text>
      </HStack>
    );
  }

  return null;
}
