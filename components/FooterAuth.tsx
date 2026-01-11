import React from 'react';
import { View, Platform, TouchableOpacity } from 'react-native';
import CustomText from './CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface FooterAuthProps {
    visible: boolean;
    onLoginPress: () => void;
}

/**
 * FooterAuth Component
 * Displays authentication footer with "Log In" CTA for guest users
 * Only visible when user is not authenticated
 */
const FooterAuth: React.FC<FooterAuthProps> = ({ visible, onLoginPress }) => {
    if (!visible) {
        return null;
    }

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: COLORS.white,
                padding: SIZES.padding,
                paddingBottom: Platform.OS === 'ios' ? 40 : SIZES.padding,
                borderTopWidth: 1,
                borderTopColor: COLORS.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                ...SHADOWS.medium,
            }}
        >
            <View>
                <CustomText variant="body">Have an account?</CustomText>
                <CustomText variant="caption">Log in to view your bookings.</CustomText>
            </View>

            <TouchableOpacity
                style={{
                    backgroundColor: COLORS.secondary,
                    paddingVertical: 12,
                    paddingHorizontal: 25,
                    borderRadius: SIZES.radius,
                }}
                onPress={onLoginPress}
                activeOpacity={0.7}
            >
                <CustomText variant="h3" color={COLORS.white}>
                    Log In
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

export default FooterAuth;
