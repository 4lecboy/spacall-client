import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import CustomText from './CustomText';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Service } from '../types';
import { getServiceImage } from '../constants/serviceImages';

interface ServiceCardProps {
    service: Service;
    onPress: (service: Service) => void;
}

/**
 * ServiceCard Component
 * Displays a single service in a card format with image, name, duration, category, and price
 * Memoized to prevent unnecessary re-renders
 */
const ServiceCard: React.FC<ServiceCardProps> = React.memo(({ service, onPress }) => {
    const [useLocalFallback, setUseLocalFallback] = useState(false);
    const handlePress = () => {
        onPress(service);
    };

    // DEBUG: Log image lookup for troubleshooting
    if (__DEV__) {
        console.log(`[${service.name}] id=${service.id}, remote=${!!service.image_url}, local=${!!getServiceImage(service)}`);
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            style={{ flex: 1 }}
        >
            <View
                style={{
                    backgroundColor: COLORS.white,
                    marginBottom: 16,
                    borderRadius: SIZES.radius,
                    padding: 12,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    ...SHADOWS.light,
                    marginHorizontal: 4,
                }}
            >
                {/* Image/Header Placeholder */}
                {(() => {
                    const local = getServiceImage(service);

                    const shouldUseRemote = !!service.image_url && !useLocalFallback;
                    const source = shouldUseRemote
                        ? { uri: service.image_url as string }
                        : local;

                    if (source) {
                        return (
                            <Image
                                source={source}
                                style={{ width: '100%', height: 110 }}
                                resizeMode="cover"
                                onError={() => {
                                    if (!useLocalFallback && local) {
                                        setUseLocalFallback(true);
                                    }
                                }}
                            />
                        );
                    }

                    return <View style={{ width: '100%', height: 110, backgroundColor: COLORS.goldLight }} />;
                })()}

                {/* Content */}
                <View style={{ width: '100%' }}>
                    <CustomText variant="h3">{service.name}</CustomText>
                    <CustomText variant="caption">
                        {service.duration_min} mins • {service.category}
                    </CustomText>
                    <CustomText
                        variant="body"
                        color={COLORS.primary}
                        style={{ marginTop: 8 }}
                    >
                        ₱{service.price}
                    </CustomText>
                </View>
            </View>
        </TouchableOpacity>
    );
});

ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;
