import React from 'react'
import {Box, Container, Grid, GridItem, Skeleton, Stack} from '@chakra-ui/react'

const CheckoutSkeleton = () => {
    return (
        <Box background="gray.50">
            <Container
                data-testid="sf-checkout-skeleton"
                maxWidth="container.xl"
                py={{base: 7, md: 16}}
                px={{base: 0, md: 4}}
            >
                <Grid templateColumns={{base: '1fr', md: '66% 1fr'}} gap={{base: 10, lg: 20}}>
                    <GridItem>
                        <Stack spacing={4}>
                            <Skeleton height="78px" />
                            <Skeleton height="78px" />
                            <Skeleton height="78px" />
                            <Skeleton height="78px" />
                        </Stack>
                    </GridItem>

                    <GridItem py={6} px={[4, 4, 0]}>
                        <Stack spacing={5}>
                            <Skeleton height="30px" width="50%" />

                            <Stack spacing={5}>
                                <Skeleton height="30px" width="65%" />

                                <Stack w="full" py={4} borderY="1px" borderColor="gray.200">
                                    <Skeleton height={6} />
                                    <Skeleton height={6} />
                                    <Skeleton height={6} />
                                </Stack>

                                <Skeleton height={6} />
                            </Stack>
                        </Stack>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    )
}

export default CheckoutSkeleton
