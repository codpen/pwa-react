import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'
import {Box, Button} from '@chakra-ui/react'
import usePromoCodeFields from './usePromoCodeFields'
import Field from '../field'

const PromoCodeFields = ({form, prefix = '', ...props}) => {
    const fields = usePromoCodeFields({form, prefix})

    const code = form.watch('code')

    return (
        <Box {...props}>
            <Field inputProps={{flex: 1, mr: 2}} {...fields.code}>
                <Button
                    type="submit"
                    fontSize="sm"
                    isLoading={form.formState.isSubmitting}
                    disabled={code?.length < 3}
                >
                    <FormattedMessage defaultMessage="Apply" />
                </Button>
            </Field>
        </Box>
    )
}

PromoCodeFields.propTypes = {
    /** Object returned from `useForm` */
    form: PropTypes.object.isRequired,

    /** Optional prefix for field names */
    prefix: PropTypes.string
}

export default PromoCodeFields
