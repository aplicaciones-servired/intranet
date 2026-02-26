import { Box, Flex, Icon, Text, ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import type { ReactNode } from "react";

const system = createSystem(defaultConfig);

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  bgColor?: string;
  iconColor?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp = true,
  bgColor = "white",
  iconColor = "#3b82f6"
}: StatsCardProps) {
  return (
    <ChakraProvider value={system}>
      <Box
        bg={bgColor}
        borderRadius="xl"
        p={6}
        borderWidth="1px"
        borderColor="gray.200"
        transition="all 0.3s"
        _hover={{ 
          transform: "translateY(-4px)",
          shadow: "lg"
        }}
      >
        <Flex justifyContent="space-between" alignItems="start">
          <Box>
            <Text fontSize="sm" color="gray.600" fontWeight="500" mb={2}>
              {title}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="gray.800" mb={2}>
              {value}
            </Text>
            {trend && (
              <Flex alignItems="center" gap={1}>
                <Text 
                  fontSize="sm" 
                  fontWeight="600"
                  color={trendUp ? "green.600" : "red.600"}
                >
                  {trendUp ? "↑" : "↓"} {trend}
                </Text>
                <Text fontSize="xs" color="gray.500">vs mes anterior</Text>
              </Flex>
            )}
          </Box>
          <Box
            bg={iconColor}
            borderRadius="lg"
            p={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon fontSize="2xl" color="white">
              {icon}
            </Icon>
          </Box>
        </Flex>
      </Box>
    </ChakraProvider>
  );
}
