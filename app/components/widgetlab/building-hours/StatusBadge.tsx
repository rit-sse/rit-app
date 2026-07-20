import React from "react";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";

export default function StatusBadge({ open }: { open: boolean }) {
  return (
    <Badge
      variant="default"
      className={open ? "bg-green-100" : "bg-red-100"}
      accessibilityLabel={open ? "Open" : "Closed"}
    >
      <Text
        className={`text-[13px] font-bold ${open ? "color-green-800" : "color-red-800"}`}
      >
        {open ? "Open" : "Closed"}
      </Text>
    </Badge>
  );
}
