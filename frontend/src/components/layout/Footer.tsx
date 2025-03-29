import React from 'react';
import { Box, Container, Text, Flex, Link, Stack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box as="footer" bg="gray.100" py={6} mt="auto">
      <Container maxW="container.xl">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          wrap="wrap"
        >
          <Box mb={{ base: 4, md: 0 }}>
            <Text fontSize="sm" color="gray.600">
              &copy; {new Date().getFullYear()} Listener App. All rights reserved.
            </Text>
          </Box>

          <Stack direction="row" spacing={6}>
            <Link as={RouterLink} to="/about" color="gray.600" fontSize="sm">
              About
            </Link>
            <Link as={RouterLink} to="/terms" color="gray.600" fontSize="sm">
              Terms
            </Link>
            <Link as={RouterLink} to="/privacy" color="gray.600" fontSize="sm">
              Privacy
            </Link>
            <Link as={RouterLink} to="/contact" color="gray.600" fontSize="sm">
              Contact
            </Link>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer; 