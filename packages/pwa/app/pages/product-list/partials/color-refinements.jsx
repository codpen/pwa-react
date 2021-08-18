/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import {Box, SimpleGrid, HStack, Text, Button, Center, useMultiStyleConfig} from '@chakra-ui/react'
import PropTypes from 'prop-types'
import {cssColorGroups} from '../../../constants'

const ColorRefinements = ({filter, toggleFilter, selectedFilters}) => {
    const styles = useMultiStyleConfig('SwatchGroup', {
        variant: 'circle',
        disabled: false
    })

    return (
        <SimpleGrid columns={2} spacing={2} mt={1}>
            {filter.values
                .filter((refinementValue) => refinementValue.hitCount > 0)
                .map((value, idx) => {
                    return (
                        <Box key={idx}>
                            <HStack
                                onClick={() =>
                                    toggleFilter(
                                        value,
                                        filter.attributeId,
                                        selectedFilters?.includes(value.value)
                                    )
                                }
                                spacing={1}
                                cursor="pointer"
                            >
                                <Button
                                    {...styles.swatch}
                                    color={
                                        selectedFilters?.includes(value.value)
                                            ? 'black'
                                            : 'gray.200'
                                    }
                                    border={selectedFilters?.includes(value.value) ? '1px' : '0'}
                                    aria-checked={selectedFilters?.includes(value.value)}
                                    variant="outline"
                                    marginRight={0}
                                    marginBottom={0}
                                >
                                    <Center
                                        {...styles.swatchButton}
                                        marginRight={0}
                                        border={
                                            value.label.toLowerCase() === 'white' &&
                                            '1px solid black'
                                        }
                                    >
                                        <Box
                                            marginRight={0}
                                            height="100%"
                                            width="100%"
                                            minWidth="32px"
                                            backgroundRepeat="no-repeat"
                                            backgroundSize="cover"
                                            backgroundColor={
                                                cssColorGroups[value.value.toLowerCase()]
                                            }
                                            background={
                                                value.value.toLowerCase() === 'miscellaneous' &&
                                                cssColorGroups[value.value.toLowerCase()]
                                            }
                                        />
                                    </Center>
                                </Button>
                                <Text
                                    display="flex"
                                    alignItems="center"
                                    fontSize="sm"
                                >{`${value.label} (${value.hitCount})`}</Text>
                            </HStack>
                        </Box>
                    )
                })}
        </SimpleGrid>
    )
}

ColorRefinements.propTypes = {
    filter: PropTypes.object,
    toggleFilter: PropTypes.func,
    selectedFilters: PropTypes.array
}

export default ColorRefinements
